"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage for token or user data
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/Signin");
    } else {
      try {
        const parsed = JSON.parse(raw);
        const role = parsed?.role;

        // Role-based route protections
        const isAdmin = role === "admin";
        const onAdminRoute = pathname?.startsWith("/Admin");
        const onUserRoute = ["/Dashboard", "/TaskList", "/AssignTask"].some((p) => pathname?.startsWith(p));

        if (isAdmin && onUserRoute) {
          router.replace("/Admin");
          setIsAuthenticated(false);
          return;
        }
        if (!isAdmin && onAdminRoute) {
          router.replace("/Dashboard");
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
      } catch {
        router.push("/Signin");
      }
    }
  }, [router, pathname]);

  // Render children only if authenticated
  return isAuthenticated ? children : null;
}
