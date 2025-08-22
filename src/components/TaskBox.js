"use client";

import { useState } from "react";
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
  Divider,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUsersList } from "@/src/redux/hooks/useUsersList";
import { STATUS_OPTIONS } from "./constants";

export default function TaskBox({
  data,
  readOnly = false,
  statusEditable = false,
}) {
  const { id, title, description, status, assignedTo, dueDate, createdAt } =
    data;

  const { users } = useUsersList();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title,
    description,
    assignedTo,
    status,
  });
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

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

  const handleSave = async () => {
    setLoading(true);
    try {
      await postUpdate(formData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // status update
  const handleQuickStatusChange = async (nextStatus) => {
    setLoading(true);
    try {
      await postUpdate({ status: nextStatus });
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
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete task");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
      setOpenDelete(false);
    }
  };

  const getStatusColor = (value) =>
    STATUS_OPTIONS.find((s) => s.value === value)?.color || "default";
  const getUserLabel = (uid) => {
    if (!uid) return "Unassigned";
    const u = users.find((x) => x.id === uid || x.uid === uid);
    return u?.displayName || u?.email || u?.uid || uid;
  };
  const formatDate = (date) => {
    if (!date) return "Not set";
    try {
      const d = new Date(date);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header Title and Status */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
          borderBottom: 1,
          borderColor: "divider",
          flexDirection: isEditing ? "column" : "row",
        }}
      >
        <Box
          sx={{
            flex: 1,
            mr: 2,
            gap: isEditing ? 2 : 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
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
            <Box sx={{ mb: 2 }}>
              {isEditing ? (
                <TextField
                  name="dueDate"
                  type="date"
                  label="Due Date"
                  size="small"
                  fullWidth
                  value={formData.dueDate || ""}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Due: {formatDate(dueDate)}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isEditing ? (
            <FormControl
              size="small"
              sx={{ minWidth: 80, mb: isEditing ? 2 : 0 }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Chip
              label={
                STATUS_OPTIONS.find((s) => s.value === status)?.label || status
              }
              color={getStatusColor(status)}
              size="small"
            />
          )}
        </Box>
      </Box>

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
      {!readOnly && (
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
      )}

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
                onClick={() => setOpenDelete(true)}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Status Only Edit Mode  */}
      {statusEditable && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Change Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => handleQuickStatusChange(e.target.value)}
              label="Change Status"
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Delete Task Dialog */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Delete Task
            <IconButton onClick={() => setOpenDelete(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenDelete(false)}
              disabled={loading}
              sx={{ ml: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}
