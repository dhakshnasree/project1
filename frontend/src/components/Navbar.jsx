// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flame, PenSquare, Home, User, Search, Bell, X } from "lucide-react";
import {
  SignedIn, SignedOut, UserButton, SignInButton
} from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchType, setSearchType] = useState("all");
  const handleSearch = async (e) => {
  const val = e.target.value;
  setQuery(val);

  if (!val.trim()) {
    setResults([]);
    return;
  }

  setSearching(true);

  try {
    const res = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(
        val.trim()
      )}&type=${searchType}`
    );

    const data = await res.json();
    setResults(data.results || []);
  } catch (err) {
    console.error("Search error:", err);
  } finally {
    setSearching(false);
  }
};

const closeSearch = () => {
  setSearchOpen(false);
  setQuery("");
  setResults([]);
};

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Flame className="w-7 h-7 text-orange-500" />
              <h1 className="font-bold text-xl">
                Failure<span className="text-orange-500">Museum</span>
              </h1>
            </Link>

            {/* Center Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`flex items-center gap-2 transition ${
                  isActive("/")
                    ? "text-orange-500 font-semibold"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                <Home size={18} /> Feed
              </Link>

              <SignedIn>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 transition ${
                    isActive("/profile")
                      ? "text-orange-500 font-semibold"
                      : "text-gray-600 hover:text-orange-500"
                  }`}
                >
                  <User size={18} /> Profile
                </Link>
              </SignedIn>

              {/* ✅ Search button now opens search bar */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition"
              >
                <Search size={18} /> Search
              </button>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <SignedIn>
                <button className="p-2 rounded-full hover:bg-gray-100 transition">
                  <Bell size={18} />
                </button>
              </SignedIn>

              <Link
                to="/create"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive("/create")
                    ? "bg-orange-500 text-white"
                    : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                }`}
              >
                <PenSquare size={16} />
                <span className="hidden sm:inline">Share Failure</span>
              </Link>

              <SignedOut>
                <SignInButton mode="modal" afterSignInUrl="/" afterSignUpUrl="/">
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm hover:bg-black transition">
                    Login
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{ elements: { avatarBox: "w-10 h-10" } }}
                />
              </SignedIn>
            </div>
          </div>
        </div>

       {/* ✅ Search bar dropdown — slides in below navbar */}
{searchOpen && (
  <div className="border-t border-gray-100 bg-white px-4 py-3">
    <div className="max-w-2xl mx-auto">

      {/* Search Type */}
      <div className="mb-2">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="posts">Posts</option>
          <option value="users">Users</option>
        </select>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          autoFocus
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={`Search ${searchType}...`}
          className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
        />

        <button
          onClick={closeSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Results */}
      {searching && (
        <p className="text-xs text-gray-400 mt-2 px-2">
          Searching...
        </p>
      )}

      {!searching && query && results.length === 0 && (
        <p className="text-xs text-gray-400 mt-2 px-2">
          No results for "{query}"
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-2 space-y-1">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => {
                if (r.type === "user") {
                  navigate("/profile");
                } else {
                  navigate("/");
                }

                closeSearch();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-orange-50 transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100">
                  {r.type === "user" ? "👤 User" : "📝 Post"}
                </span>
              </div>

              <p className="text-sm font-medium text-gray-800">
                {r.title}
              </p>

              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                {r.subtitle}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
)}
</nav>
     {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className={`flex flex-col items-center text-xs ${
              isActive("/") ? "text-orange-500" : "text-gray-500"
            }`}
          >
            <Home size={20} /> Feed
          </Link>

          {/* ✅ Mobile search button */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="flex flex-col items-center text-xs text-gray-500"
          >
            <Search size={20} /> Search
          </button>

          <Link
            to="/create"
            className={`flex flex-col items-center text-xs ${
              isActive("/create") ? "text-orange-500" : "text-gray-500"
            }`}
          >
            <PenSquare size={20} /> Create
          </Link>

          <SignedIn>
            <Link
              to="/profile"
              className={`flex flex-col items-center text-xs ${
                isActive("/profile") ? "text-orange-500" : "text-gray-500"
              }`}
            >
              <User size={20} /> Profile
            </Link>
          </SignedIn>
        </div>
      </div>
    </>
  );
}