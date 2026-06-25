import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/Postcard";
import { Flame, TrendingUp } from "lucide-react";
import { useDbUser } from "../context/UserContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // dbUser = { clerkId, dbUserId, username, email } or null if not logged in
  const dbUser = useDbUser();

  const fetchPosts = () => {
    axios
      .get(`${API_BASE}/posts`)
      .then((res) => setPosts(res.data.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Latest Failures
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Real stories. Real lessons.
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400 bg-white border border-gray-100 px-3 py-1.5 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" />
          {posts.length} stories
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="text-center text-gray-400 py-10">Loading stories...</p>}

      {/* Empty */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <Flame className="w-12 h-12 text-orange-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No failures yet. Be the first.</p>
        </div>
      )}

      {/* Feed — pass dbUser down so PostCard can like/comment as real user */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            dbUser={dbUser}
            refresh={fetchPosts}
          />
        ))}
      </div>
    </div>
  );
}