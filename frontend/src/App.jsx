import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";

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
        <div className="flex justify-center py-10">
          <SignIn />
        </div>
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/create" element={<ProtectedCreatePost />} />
            {/*
              Fixed: was /profile/:userId — but Navbar links to /profile (no param).
              ProfilePage gets the clerk_id from useUser() directly, no URL param needed.
            */}
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}