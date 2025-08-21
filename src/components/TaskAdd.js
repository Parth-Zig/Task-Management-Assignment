"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Box, Typography } from "@mui/material";
import { createTask } from "../redux/thunks/taskThunk";

export default function TaskAdd({ refetchTasks }) {
  const { user } = useSelector((state) => state.auth);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignedTo: user?.uid || "",
    },
  });

  let loading = false; // Replace with actual loading state if needed
  const onSubmit = async (data) => {
    if (!user) return;
    loading = true;

    try {
      const res = await fetch("/api/Task/createTask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          assignedTo: user.uid,
          createdBy: user.uid,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create task");

      refetchTasks(); // refresh list immediately
      reset();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      loading = false;
    }
  };

  return (
    <Box className="p-4 border rounded mb-4">
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Add New Task
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        {/* Title */}
        <Controller
          name="title"
          control={control}
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
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
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading} //is api running
        >
          {loading ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </Box>
  );
}
