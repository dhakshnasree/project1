import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import API from "../api/api";

export default function ProfilePage() {
  const { user } = useUser();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const res = await API.get(`/user-posts/${user.id}`);
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-2">
            Sign In Required
          </h2>

          <p className="text-gray-500">
            Please login to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">

      {/* Profile Header */}

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">

        <div className="flex flex-col md:flex-row gap-6 items-center">

          <img
            src={user.imageUrl}
            alt="profile"
            className="w-32 h-32 rounded-full border-4 border-orange-400"
          />

          <div className="flex-1 text-center md:text-left">

            <h1 className="text-3xl font-bold text-gray-900">
              {user.fullName || user.username}
            </h1>

            <p className="text-gray-500 mt-1">
              {user.primaryEmailAddress?.emailAddress}
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>

          </div>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">
            Failure Stories
          </h3>

          <p className="text-3xl font-bold text-orange-500">
            {posts.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">
            Lessons Shared
          </h3>

          <p className="text-3xl font-bold text-blue-500">
            {posts.filter(p => p.lesson).length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-gray-500 text-sm">
            Categories
          </h3>

          <p className="text-3xl font-bold text-green-500">
            {
              new Set(
                posts.map(p => p.category)
              ).size
            }
          </p>
        </div>

      </div>

      {/* User Posts */}

      <div className="bg-white rounded-3xl shadow-lg p-6">

        <h2 className="text-2xl font-bold mb-6">
          My Failure Stories
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No stories shared yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border rounded-2xl p-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">

                  <h3 className="font-bold text-xl">
                    {post.title}
                  </h3>

                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
                    {post.category}
                  </span>

                </div>

                <p className="text-gray-700 mb-4">
                  {post.content}
                </p>

                {post.lesson && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">

                    <h4 className="font-semibold text-yellow-700 mb-1">
                      💡 Lesson Learned
                    </h4>

                    <p className="text-yellow-800">
                      {post.lesson}
                    </p>

                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}