// src/context/UserContext.jsx
import { createContext, useContext } from "react";

export const UserContext = createContext({ dbUser: null, syncing: false });

export const useDbUser = () => {
  const ctx = useContext(UserContext);
  return ctx.dbUser; // returns just the user object, same API as before
};

export const useDbUserSyncing = () => {
  const ctx = useContext(UserContext);
  return ctx.syncing; // optional: use this to show loading states
};