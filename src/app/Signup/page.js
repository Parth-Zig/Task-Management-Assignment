"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";

// ✅ Validation schema with Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    setServerError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setServerError(result.error || "Signup failed");
        return; // stops here
      }

      // ✅ Signup successful
      localStorage.setItem("user", JSON.stringify(result.user));
      if (result.idToken) localStorage.setItem("token", result.idToken);

      router.push("/Dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setServerError("Network or server error, please try again");
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 4,
        border: "1px solid #ddd",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="h5" mb={2}>
        Sign Up
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </Button>
      </form>

      {serverError && (
        <Typography color="error" sx={{ mt: 2 }}>
          {serverError}
        </Typography>
      )}
      <Button onClick={() => router.push("/Signin")}>Sign In</Button>
    </Box>
  );
}
