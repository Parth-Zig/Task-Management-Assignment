"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { STATUS_OPTIONS } from "./constants";
import { useAuth } from "../hooks/useAuth";

export default function TaskAdd({ refetchTasks, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      status: "pending",
      assignedTo: user?.uid || "",
    },
  });

  // Fetch all users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setFetchingUsers(false);
      }
    };

    if (user?.uid) {
      fetchUsers();
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      reset((prev) => ({ ...prev, assignedTo: user.uid }));
    }
  }, [user?.uid, reset]);

  const onSubmit = async (data) => {
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          createdBy: user.uid,
          assignedTo: data.assignedTo || user.uid,
          dueDate: data.dueDate || null,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create task");

      refetchTasks?.();
      reset();
      onSuccess?.(result.task);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, height: "100%" }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Title */}
          <Controller
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Task Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                placeholder="Enter task title"
              />
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Describe the task details"
              />
            )}
          />

          {/* Row: Due Date + Status */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Due Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  placeholder="Select due date"
                  error={!!errors.dueDate}
                  helperText={errors.dueDate?.message}
                  inputProps={{ min: new Date().toISOString().split("T")[0] }}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status" defaultValue="pending">
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          {/* Assigned To */}
          <Controller
            name="assignedTo"
            control={control}
            rules={{ required: "Assignee is required" }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.assignedTo}>
                <InputLabel>Assign To</InputLabel>
                <Select {...field} label="Assign To" disabled={fetchingUsers}>
                  {users?.map((userOption) => (
                    <MenuItem key={userOption?.id} value={userOption?.id}>
                      {userOption?.displayName ||
                        userOption?.email ||
                        userOption?.uid}
                    </MenuItem>
                  ))}
                </Select>
                {errors.assignedTo && (
                  <Typography variant="caption" color="error">
                    {errors.assignedTo.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          {/* Submit Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading || !user || fetchingUsers}
              sx={{ minWidth: 120 }}
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
}
