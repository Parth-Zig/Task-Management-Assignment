"use client";

import { Button, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// import { setUser } from "@/src/redux/auth/authSlice";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/Dashboard");
  }, []);
  return null;

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (user) dispatch(setUser(user));
  // }, []);

  // // for hydration error
  // const [hydrated, setHydrated] = useState(false);
  // useEffect(() => {
  //   const savedUser = localStorage.getItem("user");
  //   if (savedUser) dispatch(setUser(JSON.parse(savedUser)));
  //   setHydrated(true);
  // }, []);
  // if (!hydrated) return null; // Wait until hydration

  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Next.js + Tailwind + MUI</h1>

      <Card className="shadow-sm rounded-2xl">
        <CardContent>
          <Typography variant="h6">Card Example</Typography>
          <Typography variant="body2">
            MUI + Tailwind, working together.
          </Typography>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4">
        <Button variant="contained">Primary</Button>
        <Button variant="outlined">Secondary</Button>
      </div>
    </main>
  );
}
