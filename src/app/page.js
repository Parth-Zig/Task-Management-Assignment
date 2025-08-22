"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/Admin");
      } else {
        router.push("/Dashboard");
      }
    } else {
      router.push("/Signin");
    }
  }, [user, router]);

  return null;
}
