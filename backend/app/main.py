from fastapi import FastAPI
from pydantic import BaseModel
from app.database import get_connection
from app.models.post import Post
from app.models.comment import Comment
app = FastAPI()

class User(BaseModel):
    username: str
    email: str


@app.get("/")
def home():
    return {"message": "Failure Museum API is running"}


@app.post("/create-user")
def create_user(user: User):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO users (username, email) VALUES (%s, %s)",
        (user.username, user.email)
    )

    conn.commit()
    conn.close()

    return {"message": "User created successfully"}
@app.post("/create-post")
def create_post(post: Post):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO posts (user_id, title, content, image_url, video_url)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (post.user_id, post.title, post.content, post.image_url, post.video_url)
    )

    conn.commit()
    conn.close()

    return {"message": "Post created successfully"}
@app.get("/posts")
def get_posts():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            posts.id,
            users.username,
            posts.title,
            posts.content,

            COUNT(DISTINCT likes.id) AS like_count,
            COUNT(DISTINCT comments.id) AS comment_count

        FROM posts
        JOIN users ON posts.user_id = users.id
        LEFT JOIN likes ON likes.post_id = posts.id
        LEFT JOIN comments ON comments.post_id = posts.id

        GROUP BY 
            posts.id,
            users.username,
            posts.title,
            posts.content

        ORDER BY posts.id DESC
    """)

    rows = cur.fetchall()
    conn.close()

    return {
        "posts": [
            {
                "id": r[0],
                "username": r[1],
                "title": r[2],
                "content": r[3],
                "like_count": r[4],
                "comment_count": r[5]
            }
            for r in rows
        ]
    }
@app.post("/like-post")
def like_post(user_id: int, post_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO likes (user_id, post_id)
        VALUES (%s, %s)
    """, (user_id, post_id))

    conn.commit()
    conn.close()

    return {"message": "Post liked"}
@app.post("/unlike-post")
def unlike_post(user_id: int, post_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM likes
        WHERE user_id = %s AND post_id = %s
    """, (user_id, post_id))

    conn.commit()
    conn.close()

    return {"message": "Post unliked"}
@app.post("/add-comment")
def add_comment(comment: Comment):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO comments (user_id, post_id, content)
        VALUES (%s, %s, %s)
    """, (comment.user_id, comment.post_id, comment.content))

    conn.commit()
    conn.close()

    return {"message": "Comment added"}
