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

export const LeftSideNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Task List", href: "/TaskList" },
    { label: "Assign Task", href: "/AssignTask" },
  ];

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
    </Box>
  );
};
