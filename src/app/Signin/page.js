"use client";

import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { auth } from "@/src/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      console.log("Logged in:", userCred.user);
      // redirect to dashboard
      window.location.href = "/Dashboard";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-8">
          <Typography variant="h5" className="mb-6 text-center font-semibold">
            Login
          </Typography>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
