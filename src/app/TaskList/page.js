"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Grid, Typography, Box } from "@mui/material";
import TaskBox from "@/src/components/TaskBox";
import TaskAdd from "@/src/components/TaskAdd";

export default function TaskList() {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch tasks from API
  const fetchTaskList = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/Task/getTaskList?uid=${user.uid}&role=${user.role || "user"}`
      );
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskList();
  }, [user]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Task List
      </Typography>

      <TaskAdd
        user={user}
        refetchTasks={() => {
          fetchTaskList();
        }}
      />

      {/* Loading / Error */}
      {loading && <Typography>Loading tasks...</Typography>}
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Task List */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {tasks.length === 0 && !loading && (
          <Typography>No tasks available.</Typography>
        )}

        {tasks.map((task) => (
          <Grid item xs={12} key={task.id}>
            <TaskBox data={task} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
