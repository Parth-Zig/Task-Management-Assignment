"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const reduxUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Check localStorage for user data
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with Redux state
  useEffect(() => {
    if (reduxUser && !user) {
      setUser(reduxUser);
    }
  }, [reduxUser, user]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user" || !user?.role,
  };
}
