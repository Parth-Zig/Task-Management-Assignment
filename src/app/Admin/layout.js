"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Container,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard,
  Assignment,
  People,
} from "@mui/icons-material";
import { useAuth } from "@/src/hooks/useAuth";
import { logoutUser } from "@/src/lib/auth";
import { toast } from "react-toastify";

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      const result = await logoutUser();

      if (result.success) {
        toast.success("Logged out successfully");
        router.push("/Signin");
      } else {
        toast.error("Logout failed, but local data cleared");
        router.push("/Signin");
      }
    } catch (error) {
      toast.error("Logout error occurred");
      router.push("/Signin");
    }
  };

  const navigationItems = [
    { label: "Dashboard", href: "/Admin", icon: <Dashboard /> },
    { label: "Tasks", href: "/Admin/Tasks", icon: <Assignment /> },
    { label: "Users", href: "/Admin/Users", icon: <People /> },
  ];

  return (
    <ProtectedRoute>
      <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Admin Panel
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 2 }}>
              <Chip
                label={user?.role || "Admin"}
                color="secondary"
                size="small"
                icon={<AccountCircle />}
              />
              <Typography
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {user?.displayName || user?.email || "Admin User"}
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => router.push(item.href)}
                  sx={{
                    minWidth: "auto",
                    px: 2,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ ml: 1 }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: { minWidth: 200 },
          }}
        >
          {navigationItems.map((item) => (
            <MenuItem
              key={item.href}
              onClick={() => {
                router.push(item.href);
                handleClose();
              }}
              sx={{ gap: 1 }}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
          <MenuItem onClick={handleLogout} sx={{ gap: 1, color: "error.main" }}>
            <Logout />
            Logout
          </MenuItem>
        </Menu>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
