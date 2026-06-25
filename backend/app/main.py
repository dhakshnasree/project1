from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import get_connection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://project1-kr4.pages.dev",
    ],
    allow_origin_regex=r"https://.*\.project1-kr4\.pages\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─── Pydantic Models ───────────────────────────────────────────

class User(BaseModel):
    clerk_id: str
    username: str
    email: str

class PostCreate(BaseModel):
    clerk_id: str
    title: str
    content: str
    lesson: Optional[str] = ""
    category: Optional[str] = "General"
    anonymous: Optional[bool] = False
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class LikeRequest(BaseModel):
    clerk_id: str
    post_id: int

class CommentCreate(BaseModel):
    clerk_id: str
    post_id: int
    comment_text: str

# ─── Health Check ──────────────────────────────────────────────
def get_user_id_from_clerk(clerk_id):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM users WHERE clerk_id = %s",
        (clerk_id,)
    )

    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        return None

    return user[0]

# ─── Users ─────────────────────────────────────────────────────
@app.post("/create-user")
def create_user(user: User):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO users (clerk_id, username, email)
        VALUES (%s, %s, %s)
        ON CONFLICT (clerk_id) DO UPDATE
          SET username = EXCLUDED.username,
              email    = EXCLUDED.email
        RETURNING id
    """, (user.clerk_id, user.username, user.email))

    db_user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        "message": "User ready",
        "db_user_id": db_user[0]
    }
# ─── Posts ─────────────────────────────────────────────────────

@app.post("/create-post-clerk")
def create_post(post: PostCreate):

    user_id = get_user_id_from_clerk(post.clerk_id)

    if not user_id:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO posts
        (
            user_id,
            title,
            content,
            lesson,
            category,
            anonymous,
            image_url,
            video_url
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """,
    (
        user_id,
        post.title,
        post.content,
        post.lesson,
        post.category,
        post.anonymous,
        post.image_url,
        post.video_url
    ))

    conn.commit()

    cur.close()
    conn.close()

    return {
        "message": "Post created"
    }
@app.get("/posts")
def get_posts():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            posts.id,
            CASE
                WHEN posts.anonymous = TRUE
                THEN 'Anonymous'
                ELSE users.username
            END AS username,
            posts.title,
            posts.content,
            posts.lesson,
            posts.category,
            posts.image_url,
            posts.created_at,
            COUNT(DISTINCT likes.id) AS like_count,
            COUNT(DISTINCT comments.id) AS comment_count
        FROM posts
        JOIN users
            ON users.id = posts.user_id
        LEFT JOIN likes
            ON likes.post_id = posts.id
        LEFT JOIN comments
            ON comments.post_id = posts.id
        GROUP BY
            posts.id,
            users.username,
            posts.title,
            posts.content,
            posts.lesson,
            posts.category,
            posts.image_url,
            posts.created_at,
            posts.anonymous
        ORDER BY posts.created_at DESC
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "posts": [
            {
                "id": r[0],
                "username": r[1],
                "title": r[2],
                "content": r[3],
                "lesson": r[4],
                "category": r[5],
                "image_url": r[6],
                "created_at": str(r[7]),
                "like_count": r[8],
                "comment_count": r[9]
            }
            for r in rows
        ]
    }

@app.get("/user-posts/{clerk_id}")
def get_user_posts(clerk_id: str):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM users WHERE clerk_id=%s",
        (clerk_id,)
    )

    user = cur.fetchone()

    if not user:
        return {"posts": []}

    user_id = user[0]

    cur.execute("""
        SELECT
            id,
            title,
            content,
            lesson,
            category,
            created_at
        FROM posts
        WHERE user_id=%s
        ORDER BY created_at DESC
    """,
    (user_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "posts": [
            {
                "id": r[0],
                "title": r[1],
                "content": r[2],
                "lesson": r[3],
                "category": r[4],
                "created_at": str(r[5])
            }
            for r in rows
        ]
    }
@app.get("/search")
def search(q: str, type: str = "all"):

    conn = get_connection()
    cur = conn.cursor()

    results = []

    # Search Posts
    if type in ["all", "posts"]:

        cur.execute("""
            SELECT
                posts.id,
                'post',
                posts.title,
                LEFT(posts.content, 120)
            FROM posts
            WHERE
                LOWER(posts.title) LIKE LOWER(%s)
                OR LOWER(posts.content) LIKE LOWER(%s)
        """,
        (f"%{q}%", f"%{q}%"))

        for row in cur.fetchall():
            results.append({
                "id": row[0],
                "type": row[1],
                "title": row[2],
                "subtitle": row[3]
            })

    # Search Users
    if type in ["all", "users"]:

        cur.execute("""
            SELECT
                id,
                'user',
                username,
                email
            FROM users
            WHERE LOWER(username) LIKE LOWER(%s)
        """,
        (f"%{q}%",))

        for row in cur.fetchall():
            results.append({
                "id": row[0],
                "type": row[1],
                "title": row[2],
                "subtitle": row[3]
            })

    cur.close()
    conn.close()

    return {
        "results": results
    }

@app.get("/trending")
def trending_posts():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            posts.id,
            posts.title,
            COUNT(likes.id) AS likes
        FROM posts
        LEFT JOIN likes
        ON likes.post_id = posts.id
        GROUP BY posts.id
        ORDER BY likes DESC
        LIMIT 5
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "trending": rows
    }
# ─── Likes ─────────────────────────────────────────────────────
@app.post("/like-post")
def like_post(req: LikeRequest):
    user_id = get_user_id_from_clerk(req.clerk_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO likes (user_id, post_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
    """, (user_id, req.post_id))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Post liked"}

# Replace /unlike-post
@app.post("/unlike-post")
def unlike_post(req: LikeRequest):
    user_id = get_user_id_from_clerk(req.clerk_id)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM likes WHERE user_id = %s AND post_id = %s",
        (user_id, req.post_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Post unliked"}

# ─── Comments ──────────────────────────────────────────────────
@app.post("/add-comment")
def add_comment(comment: CommentCreate):

    user_id = get_user_id_from_clerk(
        comment.clerk_id
    )

    if not user_id:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO comments
        (
            user_id,
            post_id,
            comment_text
        )
        VALUES (%s,%s,%s)
    """,
    (
        user_id,
        comment.post_id,
        comment.comment_text
    ))

    conn.commit()

    return {
        "message": "Comment added"
    }

@app.get("/comments/{post_id}")
def get_comments(post_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            comments.id,
            comments.comment_text,
            comments.created_at,
            users.username
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.post_id = %s
        ORDER BY comments.created_at ASC
    """, (post_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {
        "comments": [
            {
                "id":           r[0],
                "comment_text": r[1],
                "created_at":   str(r[2]) if r[2] else None,
                "username":     r[3],
            }
            for r in rows
        ]
    }