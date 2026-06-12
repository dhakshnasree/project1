import { useEffect, useState } from "react";
import API from "../api/api";

function Feed() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      console.log("API RESPONSE:", res.data);
      setPosts(res.data.posts);
    } catch (err) {
      console.log("Error:", err);
    }
  };
  
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "Arial" }}>
      <h1>🔥 Failure Museum</h1>

      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              marginBottom: 10,
              borderRadius: 10
            }}
          >
            <h3>{post.title}</h3>
            <p><b>@{post.username}</b></p>
            <p>{post.content}</p>

            <p>
              ❤️ {post.like_count} | 💬 {post.comment_count}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Feed;