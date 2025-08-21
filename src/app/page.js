"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Box, Typography, Button, Container, Paper, CircularProgress } from "@mui/material";
import { useAuth } from "@/src/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setIsRedirecting(true);
      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/Admin");
      } else {
        router.push("/Dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || isRedirecting) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            {isRedirecting ? "Redirecting..." : "Loading..."}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 6, borderRadius: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Task Management System
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Organize, track, and manage your tasks efficiently
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/Signin")}
              sx={{ minWidth: 120 }}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/Signup")}
              sx={{ minWidth: 120 }}
            >
              Sign Up
            </Button>
          </Box>

          <Box sx={{ mt: 6, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="primary" gutterBottom>
                ✨
              </Typography>
              <Typography variant="h6" gutterBottom>
                Easy Task Creation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and assign tasks with just a few clicks
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="primary" gutterBottom>
                📊
              </Typography>
              <Typography variant="h6" gutterBottom>
                Real-time Updates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                See changes instantly across all devices
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="primary" gutterBottom>
                🔒
              </Typography>
              <Typography variant="h6" gutterBottom>
                Secure & Private
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your data is protected and private
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
