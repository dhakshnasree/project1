import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

import Navbar from "./components/Navbar";
import FeedPage from "./pages/FeedPage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";

function ProtectedCreatePost() {
  return (
    <>
      <SignedIn>
        <CreatePostPage />
      </SignedIn>

      <SignedOut>
        <div className="text-center mt-10">
          <p className="text-gray-600 mb-4">
            You need to sign in to create a post.
          </p>
          <SignInButton mode="modal" fallbackRedirectUrl="/create">
            <button className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition">
              Login to Continue
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/create" element={<ProtectedCreatePost />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}