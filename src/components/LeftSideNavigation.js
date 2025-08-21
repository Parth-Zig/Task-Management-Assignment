"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import Link from "next/link";
import { logoutUser } from "@/src/lib/auth";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { resetAuthState } from "@/src/redux/reducers/auth/authSlice";

export const LeftSideNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const navItems = [
    { label: "Task List", href: "/TaskList" },
    { label: "Assign Task", href: "/AssignTask" },
  ];

  // Logout handler
  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      // Clear Redux state
      dispatch(resetAuthState());
      
      if (result.success) {
        toast.success("Logged out successfully");
        router.push("/Signin");
      } else {
        toast.error("Logout failed, but local data cleared");
        router.push("/Signin");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Clear Redux state even if there's an error
      dispatch(resetAuthState());
      toast.error("Logout error occurred");
      // Force redirect even if there's an error
      router.push("/Signin");
    }
  };

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Dashboard heading */}
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{ borderBottom: 1, mb: 2, pb: 1, cursor: "pointer" }}
        onClick={() => router.push("/Dashboard")}
      >
        Dashboard
      </Typography>

      {/* Navigation links */}
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            sx={{
              mb: 1,
              borderRadius: 1,
              bgcolor: pathname === item.href ? "primary.main" : "transparent",
              color:
                pathname === item.href
                  ? "primary.contrastText"
                  : "text.primary",
              "&:hover": {
                bgcolor:
                  pathname === item.href ? "primary.dark" : "action.hover",
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      {/* Logout button at bottom */}
      <Box sx={{ mt: "auto" }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            bgcolor: "error.main",
            "&:hover": {
              bgcolor: "error.dark",
            },
          }}
        >
          <ListItemText primary="Logout" sx={{ color: "white" }} />
        </ListItemButton>
      </Box>
    </Box>
  );
};
