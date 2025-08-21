"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage for token or user data
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/Signin");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Render children only if authenticated
  return isAuthenticated ? children : null;
}
