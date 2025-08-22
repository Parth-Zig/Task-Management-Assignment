"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { useAssignedTasks } from "@/src/redux/hooks/useAssignedTasks";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import TaskBox from "@/src/components/TaskBox";
import { useMemo, useState } from "react";
import { STATUS_OPTIONS } from "@/src/components/constants";

export default function AssignTask() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading } = useAssignedTasks(user?.uid);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch =
        !s ||
        [t.title, t.description].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(s)
        );
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tasks Assigned To Me
        </Typography>
        <Alert severity="info">Please sign in to view assigned tasks.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tasks Assigned To Me
      </Typography>

      {/* Filters Row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          placeholder="Search tasks by Title, Description"
          label="Search"
          sx={{ flex: 1, height: "56px" }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem key={"All"} value="">
              All
            </MenuItem>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Loading State */}
      {tasksLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!tasksLoading && filtered.length === 0 && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No tasks assigned to you yet.
          </Typography>
        </Box>
      )}

      {/* Tasks Grid */}
      {!tasksLoading && filtered.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {filtered.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Box
                sx={{
                  p: 0,
                  width: "275px",
                  height: "100%",
                }}
              >
                <TaskBox data={task} readOnly={true} statusEditable={true} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
