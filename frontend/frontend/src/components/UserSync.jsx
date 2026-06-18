// src/components/UserSync.jsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { UserContext } from "../context/UserContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function UserSync({ children }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setDbUser(null);
      return;
    }

    const sync = async () => {
      setSyncing(true);
      try {
        const username =
          user.username ||
          user.firstName ||
          user.emailAddresses[0]?.emailAddress?.split("@")[0] ||
          "user";

        const email = user.emailAddresses[0]?.emailAddress || "";

        const res = await fetch(`${API}/create-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: user.id,
            username,
            email,
          }),
        });

        if (!res.ok) throw new Error(`create-user failed: ${res.status}`);

        const data = await res.json();

        setDbUser({
          clerkId: user.id,
          dbUserId: data.db_user_id,
          username,
          email,
        });
      } catch (err) {
        console.error("UserSync error:", err);
        setDbUser(null);
      } finally {
        setSyncing(false);
      }
    };

    sync();
  }, [isSignedIn, isLoaded, user?.id]); // use user?.id not user object

  return (
    <UserContext.Provider value={{ dbUser, syncing }}>
      {children}
    </UserContext.Provider>
  );
}