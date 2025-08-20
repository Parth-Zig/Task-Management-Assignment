"use client";

import { Button, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  // useEffect(() => {
  //   router.push("/Dashboard");
  // }, []);
  // return null;
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
