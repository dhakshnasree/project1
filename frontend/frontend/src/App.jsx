import { useEffect, useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export default function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 📥 Fetch posts
  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data.posts || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ➕ Create post
  const createPost = async () => {
    if (!title || !content) return;

    await API.post("/create-post", {
      user_id: 1,
      title,
      content,
      image_url: null,
      video_url: null,
    });

    setTitle("");
    setContent("");
    fetchPosts();
  };

  // ❤️ Like post
  const likePost = async (postId) => {
    await API.post("/like-post", {
      user_id: 1,
      post_id: postId,
    });

    fetchPosts();
  };

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <h1 style={styles.title}>🔥 Failure Museum</h1>

      {/* CREATE POST BOX */}
      <div style={styles.card}>
        <h3>Create a Failure Post</h3>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Share your failure story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={createPost} style={styles.button}>
          Publish to Museum
        </button>
      </div>

      {/* FEED */}
      {posts.length === 0 ? (
        <div style={styles.empty}>
          <h2>🏛️ The museum is empty</h2>
          <p>Be the first to share a failure</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={styles.card}>
            <h3>{post.title}</h3>
            <p style={styles.user}>@{post.username}</p>
            <p>{post.content}</p>

            <div style={styles.actions}>
              <button onClick={() => likePost(post.id)}>
                ❤️ {post.like_count || 0}
              </button>

              <button>💬 {post.comment_count || 0}</button>

              <button>🔗 Share</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* 🎨 SIMPLE STYLES */
const styles = {
  page: {
    maxWidth: 600,
    margin: "0 auto",
    fontFamily: "Arial",
    padding: 20,
    background: "#f5f5f5",
    minHeight: "100vh",
  },

  title: {
    textAlign: "center",
    marginBottom: 20,
  },

  card: {
    background: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },

  textarea: {
    width: "100%",
    padding: 10,
    height: 80,
    marginBottom: 10,
  },

  button: {
    background: "#e63946",
    color: "white",
    border: "none",
    padding: 10,
    cursor: "pointer",
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  user: {
    color: "gray",
    fontSize: 14,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
  },
};