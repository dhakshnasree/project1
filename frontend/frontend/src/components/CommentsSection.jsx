import { useState, useEffect } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
export default function CommentsSection({ postId }) {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/comments/${postId}`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await axios.post("http://localhost:8000/add-comment", {
        user_id: currentUserId,
        post_id: postId,
        comment_text: text.trim(),
      });
      setText("");
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
      {/* Input */}
      <div className="flex items-center gap-2 pt-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Write a comment..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-full p-2 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Comments list */}
      {loading ? (
        <p className="text-xs text-gray-400 mt-3">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 mt-3">No comments yet. Be the first!</p>
      ) : (
        <div className="mt-3 space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0 mt-0.5" />
              <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 text-sm flex-1 border border-gray-100">
                <span className="font-semibold text-gray-800 text-xs">{c.username} </span>
                <span className="text-gray-600">{c.comment_text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}