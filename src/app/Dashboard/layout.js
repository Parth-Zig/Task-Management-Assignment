"use client"; // must be first line for useState/hooks

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { LeftSideNavigation } from "@/src/components/LeftSideNavigation";
import {
  Box,
  Drawer,
  Toolbar,
  AppBar,
  IconButton,
  Typography,
  CssBaseline,
  Button,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Logout, AccountCircle } from "@mui/icons-material";
import { useAuth } from "@/src/hooks/useAuth";
import { logoutUser } from "@/src/lib/auth";
import { toast } from "react-toastify";

const drawerWidth = 240;

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  let theme = useTheme();
  let smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

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
      console.error("Logout error:", error);
      toast.error("Logout error occurred");
      // Force redirect even if there's an error
      router.push("/Signin");
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <LeftSideNavigation />
    </div>
  );

  return (
    <ProtectedRoute>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CssBaseline />

        {/* AppBar for mobile */}
        <AppBar
          position="fixed"
          sx={{ display: { sm: "none" }, width: "100%" }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <Button
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          {/* Temporary drawer for mobile */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>

          {/* Permanent drawer for desktop */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "#f5f5f5",
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          {/* Top bar with user info and logout */}
          <Box
            sx={{
              mt: smDown ? 6 : 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              p: 2,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={user?.role || "User"}
                color="primary"
                size="small"
                icon={<AccountCircle />}
              />
              <Typography variant="body1">
                Welcome, {user?.displayName || user?.email || "User"}!
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              Logout
            </Button>
          </Box>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
