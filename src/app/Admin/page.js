"use client";

import { useAdminAnalytics } from "@/src/redux/hooks/useAdminAnalytics";
import { Card, CardContent, Typography, Grid, Box, LinearProgress, Chip } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, People, Assignment, Warning } from "@mui/icons-material";

const COLORS = ["#FF8042", "#0088FE", "#00C49F"];
const STATUS_COLORS = {
  todo: "#FF8042",
  "in-progress": "#0088FE", 
  done: "#00C49F"
};

export default function AdminDashboard() {
  const { stats, completionRate, avgTasksPerUser, loading } = useAdminAnalytics();

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  const pieData = [
    { name: "Todo", value: stats.tasksByStatus.todo, color: STATUS_COLORS.todo },
    { name: "In Progress", value: stats.tasksByStatus["in-progress"], color: STATUS_COLORS["in-progress"] },
    { name: "Done", value: stats.tasksByStatus.done, color: STATUS_COLORS.done },
  ];

  const userRoleData = [
    { name: "Admins", value: stats.usersByRole.admin, color: "#FF6B6B" },
    { name: "Users", value: stats.usersByRole.user, color: "#4ECDC4" },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Completion Rate
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="success.main">
                {completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Overdue Tasks
                </Typography>
              </Box>
              <Typography variant="h3" component="div" color="warning.main">
                {stats.overdueTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Additional Stats */}
      <Grid container spacing={3}>
        {/* Task Status Distribution */}
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

        {/* User Role Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Role Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userRoleData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {avgTasksPerUser}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Tasks per User
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="warning.main">
                      {stats.tasksByStatus.todo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Todo Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="info.main">
                      {stats.tasksByStatus["in-progress"]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="success.main">
                      {stats.tasksByStatus.done}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Done Tasks
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}


