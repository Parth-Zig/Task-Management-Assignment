"use client";

import * as React from "react";
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Divider,
  Link,
  Alert,
  CircularProgress
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { loginUser } from "@/src/lib/auth";
import { toast } from "react-toastify";
import { LockOutlined, Email, Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetAuthState } from "@/src/redux/reducers/auth/authSlice";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  
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
    setServerError("");
    
    try {
      const result = await loginUser(data?.email, data?.password);
      
      if (result?.error) {
        setServerError(result.error);
        return;
      }

      if (result.success) {
        // Clear any existing auth state
        dispatch(resetAuthState());
        
        // Navigate to dashboard
        localStorage.setItem("user", JSON.stringify(result.user));
        toast.success("Welcome back!");
        
        // Redirect based on user role
        if (result.user?.role === "admin") {
          router.push("/Admin");
        } else {
          router.push("/Dashboard");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setServerError("Server error, please try again");
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 6,
            borderRadius: 3,
            width: "100%",
            maxWidth: 450,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <LockOutlined sx={{ color: "white", fontSize: 30 }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          {/* Error Alert */}
          {serverError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {serverError}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
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
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ minWidth: "auto", p: 0.5 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </Button>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Signing In...
                </Box>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?
            </Typography>
          </Divider>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              onClick={() => router.push("/Signup")}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
                textTransform: "none",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                },
              }}
            >
              Create Account
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
