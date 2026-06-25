import API from "../api/api";

function PostCard({ post, refresh }) {

  const likePost = async () => {
    await API.post("/like-post", {
      user_id: 1,
      post_id: post.id
    });
    refresh();
  };

  const unlikePost = async () => {
    await API.post("/unlike-post", {
      user_id: 1,
      post_id: post.id
    });
    refresh();
  };

  return (
    <div style={styles.card}>
      <h3>{post.title}</h3>
      <p><b>{post.username}</b></p>
      <p>{post.content}</p>

      <p>
        ❤️ {post.like_count} | 💬 {post.comment_count}
      </p>

      <button onClick={likePost}>Like</button>
      <button onClick={unlikePost}>Unlike</button>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8
  }
};

export default PostCard;