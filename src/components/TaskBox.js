"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Box, Typography, Chip, Paper, Button, TextField } from "@mui/material";

export default function TaskBox({ data, refetchTasks }) {
  const { user } = useSelector((state) => state.auth);
  const { id, title, description, status, assignedTo } = data;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title,
    description,
    assignedTo,
    status,
  });
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Save updated task
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/Task/updateTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: formData }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update task");

      setIsEditing(false);
      refetchTasks?.(); // refresh tasks after update
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/Task/deleteTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete task");

      refetchTasks?.();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      {/* Top: Title and Status */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isEditing ? (
          <TextField
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        ) : (
          <Typography variant="h6">{title}</Typography>
        )}

        {isEditing ? (
          <TextField
            name="status"
            value={formData.status}
            onChange={handleChange}
            size="small"
          />
        ) : (
          <Chip
            label={status}
            color={
              status === "done"
                ? "success"
                : status === "in-progress"
                ? "warning"
                : "error"
            }
            size="small"
          />
        )}
      </Box>

      {/* Middle: Assigned To */}
      <Box sx={{ mt: 1 }}>
        {isEditing ? (
          <TextField
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            size="small"
            fullWidth
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Assigned to: {assignedTo || "Unassigned"}
          </Typography>
        )}
      </Box>

      {/* Bottom: Description */}
      <Box sx={{ mt: 1 }}>
        {isEditing ? (
          <TextField
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            size="small"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        {isEditing ? (
          <>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
}
