"use client";

/**
 * 
 * here is the add task make a task suppoerted title description , due date, status, and assigned to 
 * in assigned to is nothing but a dropdown which have values of all the user
 */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
  Grid,
  Paper,
  Divider
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export default function TaskAdd({ refetchTasks, onSuccess }) {
  const { user } = useSelector((state) => state.auth);
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

  // Fetch all users for the assignedTo dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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

  // Keep form in sync once user becomes available
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
          // createdBy required; assignedTo optional (defaults handled server-side)
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

  const statusOptions = [
    { value: "todo", label: "Todo" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" }
  ];

  return (
    <Paper elevation={0} sx={{ p: 0 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
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
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
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
          </Grid>

          {/* Due Date */}
          <Grid item xs={12} md={6}>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Due Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  placeholder="Select due date"
                />
              )}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    {...field}
                    label="Status"
                    defaultValue="pending"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Assigned To */}
          <Grid item xs={12}>
            <Controller
              name="assignedTo"
              control={control}
              rules={{ required: "Assignee is required" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.assignedTo}>
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    {...field}
                    label="Assign To"
                    disabled={fetchingUsers}
                  >
                    {users.map((userOption) => (
                      <MenuItem key={userOption.id} value={userOption.id}>
                        {userOption.displayName || userOption.email || userOption.uid}
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
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
