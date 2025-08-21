"use client";

import { useUserTasksAnalytics } from "@/src/redux/hooks/useUserTasksAnalytics";
import { useSelector } from "react-redux";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, Typography, Grid, Card, CardContent, LinearProgress } from "@mui/material";
import { Assignment, Person } from "@mui/icons-material";

const COLORS = ["#FF8042", "#0088FE", "#00C49F"];

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const { stats, loading } = useUserTasksAnalytics(user?.uid);

  const createdData = [
    { name: "Todo", value: stats.createdByStatus?.todo || 0 },
    { name: "In Progress", value: stats.createdByStatus?.["in-progress"] || 0 },
    { name: "Done", value: stats.createdByStatus?.done || 0 },
  ];

  const assignedData = [
    { name: "Todo", value: stats.assignedByStatus?.todo || 0 },
    { name: "In Progress", value: stats.assignedByStatus?.["in-progress"] || 0 },
    { name: "Done", value: stats.assignedByStatus?.done || 0 },
  ];

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        My Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Assignment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Created Tasks
                </Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.createdCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Assigned Tasks
                </Typography>
              </Box>
              <Typography variant="h3" component="div">
                {stats.assignedCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Created Tasks Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Created Tasks Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={createdData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {createdData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Assigned Tasks Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assigned Tasks Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assignedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assignedData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
