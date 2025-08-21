"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { useState } from "react";
import { PersonAdd, Email, Visibility, VisibilityOff, Person } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { resetAuthState } from "@/src/redux/reducers/auth/authSlice";

// ✅ Validation schema with Yup
const validationSchema = Yup.object({
  displayName: Yup.string()
    .required("Display name is required")
    .min(2, "Display name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  role: Yup.string()
    .required("Role is required")
    .oneOf(["user", "admin"], "Invalid role selected"),
});

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { 
      displayName: "", 
      email: "", 
      password: "", 
      confirmPassword: "",
      role: "user"
    },
  });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          displayName: data.displayName,
          role: data.role,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setServerError(result.error || "Signup failed");
        return;
      }

      // Clear any existing auth state
      dispatch(resetAuthState());
      
      // ✅ Signup successful
      localStorage.setItem("user", JSON.stringify(result.user));
      if (result.idToken) localStorage.setItem("token", result.idToken);

      // Redirect based on role
      if (result.user?.role === "admin") {
        router.push("/Admin");
      } else {
        router.push("/Dashboard");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setServerError("Network or server error, please try again");
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
            maxWidth: 500,
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
              <PersonAdd sx={{ color: "white", fontSize: 30 }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join us and start managing your tasks efficiently
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
              name="displayName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.displayName}
                  helperText={errors.displayName?.message}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: "text.secondary" }} />,
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
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    {...field}
                    label="Role"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
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

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        sx={{ minWidth: "auto", p: 0.5 }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                  Creating Account...
                </Box>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
          </Divider>

          {/* Sign In Link */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              onClick={() => router.push("/Signin")}
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
              Sign In
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
