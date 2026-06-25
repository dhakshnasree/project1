import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Postcard({ post, dbUser, refresh }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // NEW
  const [liked, setLiked] = useState(post.is_liked || false);

  useEffect(() => {
    setLiked(post.is_liked || false);
  }, [post.is_liked]);

  const handleLike = async () => {
    if (!dbUser) {
      alert("Please log in to like posts.");
      return;
    }

    setLikeLoading(true);

    try {
      const res = await fetch(`${API_BASE}/like-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: dbUser.clerkId,
          post_id: post.id,
        }),
      });

      if (!res.ok) throw new Error("Like failed");

      setLiked(true);
      refresh();
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleUnlike = async () => {
    if (!dbUser) return;

    setLikeLoading(true);

    try {
      const res = await fetch(`${API_BASE}/unlike-post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: dbUser.clerkId,
          post_id: post.id,
        }),
      });

      if (!res.ok) throw new Error("Unlike failed");

      setLiked(false);
      refresh();
    } catch (err) {
      console.error("Unlike error:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/comments/${post.id}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments((v) => !v);
  };

  const handleAddComment = async () => {
    if (!dbUser) {
      alert("Please log in to comment.");
      return;
    }

    if (!commentText.trim()) return;

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/add-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: dbUser.clerkId,
          post_id: post.id,
          comment_text: commentText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Comment failed");

      setCommentText("");
      fetchComments();
      refresh();
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (post.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {post.username}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="ml-auto text-xs bg-orange-50 text-orange-500 px-3 py-1 rounded-full font-medium">
          #{post.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>

      {/* Content */}
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        {post.content}
      </p>

      {/* Lesson */}
      {post.lesson && (
        <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-xl mb-3">
          <p className="text-xs font-semibold text-amber-700 mb-0.5">
            💡 Lesson learned
          </p>
          <p className="text-sm text-amber-800">{post.lesson}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
        <button
          onClick={liked ? handleUnlike : handleLike}
          disabled={likeLoading}
          className="flex items-center gap-1.5 text-sm transition disabled:opacity-50"
        >
          <Heart
            className={`w-4 h-4 transition ${
              liked
                ? "fill-red-500 text-red-500"
                : "text-gray-500 hover:text-red-500"
            }`}
          />
          <span>{post.like_count}</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-500 transition ml-auto"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count}</span>
          {showComments ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 space-y-3">
          {commentsLoading && (
            <p className="text-xs text-gray-400">
              Loading comments...
            </p>
          )}

          {!commentsLoading && comments.length === 0 && (
            <p className="text-xs text-gray-400">
              No comments yet. Be first!
            </p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-semibold shrink-0">
                {(c.username || "?")[0].toUpperCase()}
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-700">
                  {c.username}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {c.comment_text}
                </p>
              </div>
            </div>
          ))}

          {dbUser ? (
            <div className="flex gap-2 mt-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAddComment()
                }
                placeholder="Add a comment..."
                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                onClick={handleAddComment}
                disabled={submitting || !commentText.trim()}
                className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">
              Log in to leave a comment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}