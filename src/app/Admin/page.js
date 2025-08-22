"use client";

import { useAdminAnalytics } from "@/src/redux/hooks/useAdminAnalytics";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { People, Assignment } from "@mui/icons-material";

const STATUS_COLORS = {
  todo: "#FF8042",
  "in-progress": "#0088FE",
  done: "#00C49F",
};

export default function AdminDashboard() {
  const { stats, loading } = useAdminAnalytics();

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  const pieData = [
    {
      name: "Todo",
      value: stats.tasksByStatus.todo,
      color: STATUS_COLORS.todo,
    },
    {
      name: "In Progress",
      value: stats.tasksByStatus["in-progress"],
      color: STATUS_COLORS["in-progress"],
    },
    {
      name: "Done",
      value: stats.tasksByStatus.done,
      color: STATUS_COLORS.done,
    },
  ];

  const userRoleData = [
    { name: "Admins", value: stats.usersByRole.admin, color: "#FF6B6B" },
    { name: "Users", value: stats.usersByRole.user, color: "#4ECDC4" },
  ];

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 4, color: "text.primary" }}
      >
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Task Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Assignment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.totalTasks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <People color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <Typography variant="h3" component="div">
                  {stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Box>
      </Grid>
    </>
  );
}
