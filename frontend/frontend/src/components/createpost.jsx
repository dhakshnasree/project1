import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import API from "../api/api";

export default function CreatePost({ refresh }) {
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please enter title and content");
      return;
    }

    try {
      setLoading(true);

      await API.post("/create-post", {
        clerk_id: user?.id,
        username: anonymous
          ? "Anonymous Contributor"
          : user?.fullName || user?.username || "User",

        title,
        content,
        image_url: null,
        video_url: null,
        anonymous,
      });

      setTitle("");
      setContent("");
      setAnonymous(false);

      refresh?.();

      alert("Failure story published!");
    } catch (error) {
      console.error(error);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 mb-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        🔥 Share Your Failure Story
      </h2>

      <p className="text-slate-500 mb-5">
        Your lessons may help someone avoid the same mistake.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Give your story a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-orange-400 outline-none"
        />

        <textarea
          placeholder="What happened? What went wrong? What lesson did you learn?"
          rows="6"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-slate-300 rounded-xl p-3 mb-4 focus:ring-2 focus:ring-orange-400 outline-none resize-none"
        />

        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
            className="w-4 h-4"
          />

          <span className="text-slate-700">
            Post anonymously
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
        >
          {loading ? "Publishing..." : "🚀 Publish to Museum"}
        </button>
      </form>
    </div>
  );
}