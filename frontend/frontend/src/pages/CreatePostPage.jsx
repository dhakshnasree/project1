import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Send } from "lucide-react";
import { useDbUser } from "../context/UserContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CATEGORIES = [
  "Interview", "Startup", "Career", "Management",
  "Tech", "Finance", "Education", "General",
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const dbUser = useDbUser(); // { clerkId, dbUserId, username, email }

  const [form, setForm] = useState({
    title: "",
    content: "",
    lesson: "",
    category: "General",
    anonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and story are required.");
      return;
    }

    // Guard: should not reach here since page is protected, but just in case
    if (!dbUser) {
      setError("You must be logged in to post.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/create-post-clerk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: dbUser.clerkId,   // ✅ real user — no more hardcoded 1
          title: form.title,
          content: form.content,
          lesson: form.lesson,
          category: form.category,
          anonymous: form.anonymous,
        }),
      });

      if (!res.ok) throw new Error("Post creation failed");

      navigate("/");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const charCount = form.content.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Share your failure
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Someone out there needs to hear this.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border
                  ${form.category === cat
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300"
                  }`}
              >
                #{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            What failed?
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. I failed my first 5 job interviews"
            maxLength={120}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-gray-300"
          />
        </div>

        {/* Story */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Tell the story
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={5}
            maxLength={1000}
            placeholder="What happened, how it felt, what went wrong..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-gray-300 resize-none"
          />
          <p className={`text-xs mt-1 text-right ${charCount > 900 ? "text-orange-400" : "text-gray-300"}`}>
            {charCount}/1000
          </p>
        </div>

        {/* Lesson */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            💡 Lesson learned{" "}
            <span className="text-gray-300 font-normal">(optional)</span>
          </label>
          <textarea
            name="lesson"
            value={form.lesson}
            onChange={handleChange}
            rows={2}
            maxLength={300}
            placeholder="What would you do differently?"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-gray-300 resize-none"
          />
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="anonymous"
            checked={form.anonymous}
            onChange={(e) => setForm((f) => ({ ...f, anonymous: e.target.checked }))}
            className="w-4 h-4 accent-orange-500"
          />
          <label htmlFor="anonymous" className="text-sm text-gray-600">
            Post anonymously
          </label>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? "Publishing..." : "Publish to Museum"}
        </button>
      </div>
    </div>
  );
}