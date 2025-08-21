"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { 
  Box, 
  Typography, 
  Chip, 
  Paper, 
  Button, 
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from "@mui/material";
import { useUsersList } from "@/src/redux/hooks/useUsersList";

export default function TaskBox({ data, refetchTasks, readOnly = false, statusEditable = false }) {
  const { user } = useSelector((state) => state.auth);
  const { id, title, description, status, assignedTo, dueDate, createdAt } = data;

  const { users } = useUsersList();

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

  const postUpdate = async (updates) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to update task");
  };

  // Save updated task (full edit)
  const handleSave = async () => {
    setLoading(true);
    try {
      await postUpdate(formData);
      setIsEditing(false);
      refetchTasks?.();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick status update (for assigned tasks)
  const handleQuickStatusChange = async (nextStatus) => {
    setLoading(true);
    try {
      await postUpdate({ status: nextStatus });
      refetchTasks?.();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
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

  // Status options
  const statusOptions = [
    { value: "todo", label: "Todo", color: "default" },
    { value: "in-progress", label: "In Progress", color: "warning" },
    { value: "done", label: "Done", color: "success" }
  ];

  const getStatusColor = (value) => statusOptions.find((s) => s.value === value)?.color || "default";
  const getUserLabel = (uid) => {
    if (!uid) return "Unassigned";
    const u = users.find((x) => x.id === uid || x.uid === uid);
    return u?.displayName || u?.email || u?.uid || uid;
  };
  const formatDate = (date) => {
    if (!date) return "Not set";
    try {
      const d = new Date(date);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header: Title and Status */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ flex: 1, mr: 2 }}>
          {isEditing ? (
            <TextField
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              size="small"
              label="Title"
            />
          ) : (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          )}
          
          {/* Due Date Display */}
          {dueDate && (
            <Typography variant="caption" color="text.secondary">
              Due: {formatDate(dueDate)}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isEditing ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Chip
              label={statusOptions.find(s => s.value === status)?.label || status}
              color={getStatusColor(status)}
              size="small"
            />
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Description */}
      <Box sx={{ mb: 2 }}>
        {isEditing ? (
          <TextField
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            size="small"
            label="Description"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      {/* Assigned To */}
      <Box sx={{ mb: 2 }}>
        {isEditing ? (
          <FormControl size="small" fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select
              name="assignedTo"
              value={formData.assignedTo || ""}
              onChange={handleChange}
              label="Assign To"
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.displayName || u.email || u.uid}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Assigned to: {getUserLabel(assignedTo)}
          </Typography>
        )}
      </Box>

      {/* Created Date */}
      {createdAt && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Created: {formatDate(createdAt)}
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      {!readOnly && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
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
      )}

      {/* Status Only Edit Mode (for assigned tasks) */}
      {statusEditable && !isEditing && !readOnly && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Quick Status Update:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Change Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => handleQuickStatusChange(e.target.value)}
              label="Change Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Paper>
  );
}
