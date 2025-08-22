"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import {
  Typography,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Download } from "@mui/icons-material";
import DataTable from "@/src/components/DataTable";
import { toast } from "react-toastify";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({
    open: false,
    task: null,
    formData: {},
  });

  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [dueDateRange, setDueDateRange] = useState([null, null]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });

  useEffect(() => {
    const tasksQuery = query(collection(db, "tasks"));
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTasks(data);
    });

    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snap) => {
      const userData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(userData);
      setLoading(false);
    });

    return () => {
      unsubTasks();
      unsubUsers();
    };
  }, []);

  const getUserDisplayName = (userId) => {
    if (!userId) return "Unassigned";
    const user = users.find((u) => u.uid === userId || u.id === userId);
    return user ? user.displayName || user.email || userId : userId;
  };

  const transformedTasks = tasks.map((task) => ({
    ...task,
    assignedToDisplay: getUserDisplayName(task.assignedTo),
    createdByDisplay: getUserDisplayName(task.createdBy),
  }));

  const filteredTasks = transformedTasks.filter((task) => {
    const matchesAssignedTo =
      !assignedToFilter || task.assignedTo === assignedToFilter;
    const matchesCreatedBy =
      !createdByFilter || task.createdBy === createdByFilter;

    const matchesDueDate =
      (!dueDateRange[0] || task.dueDate >= dueDateRange[0]?.getTime()) &&
      (!dueDateRange[1] || task.dueDate <= dueDateRange[1]?.getTime());

    return matchesAssignedTo && matchesCreatedBy && matchesDueDate;
  });

  const exportToCSV = () => {
    if (transformedTasks.length === 0) {
      toast.warning("No tasks to export");
      return;
    }

    const headers = [
      "Title",
      "Description",
      "Status",
      "Assigned To",
      "Created By",
      "Created Date",
      "Due Date",
    ];
    const csvData = transformedTasks.map((task) => [
      task.title || "",
      task.description || "",
      task.status || "",
      task.assignedToDisplay || "",
      task.createdByDisplay || "",
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "",
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `tasks_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Tasks exported to CSV successfully!");
  };

  const handleEdit = (task) => {
    setEditDialog({
      open: true,
      task,
      formData: {
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        assignedTo: task.assignedTo || "",
      },
    });
  };
  const openDeleteDialog = (task) => {
    setDeleteDialog({ open: true, task });
  };
  const handleDelete = async (task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete task");
      }

      toast.success("Task deleted successfully");
      setDeleteDialog({ open: false, task });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete task");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/tasks/${editDialog.task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDialog.formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }

      toast.success("Task updated successfully");
      setEditDialog({ open: false, task: null, formData: {} });
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update task");
    }
  };

  const handleFormChange = (field, value) => {
    setEditDialog((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  };

  const columns = [
    { key: "title", label: "Title", type: "truncate" },
    { key: "description", label: "Description", type: "truncate" },
    { key: "status", label: "Status", type: "status" },
    { key: "assignedToDisplay", label: "Assigned To" },
    { key: "createdByDisplay", label: "Created By" },
    { key: "createdAt", label: "Created Date", type: "date" },
    { key: "dueDate", label: "Due Date", type: "date" },
  ];

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      values: [
        { label: "Todo", value: "todo" },
        { label: "In Progress", value: "in-progress" },
        { label: "Done", value: "done" },
      ],
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      values:
        users?.map((user) => ({
          label: user.displayName || user.email,
          value: user.uid || user.id,
        })) || [],
    },
    {
      key: "createdBy",
      label: "Created By",
      values:
        users?.map((user) => ({
          label: user.displayName || user.email,
          value: user.uid || user.id,
        })) || [],
    },
  ];

  const actions = [
    {
      icon: <Edit />,
      label: "Edit",
      tooltip: "Edit task",
      onClick: handleEdit,
      color: "primary",
    },
    {
      icon: <Delete />,
      label: "Delete",
      tooltip: "Delete task",
      onClick: openDeleteDialog,
      color: "error",
    },
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "text.primary" }}>
          Task Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={exportToCSV}
          sx={{ minWidth: 120 }}
        >
          Export CSV
        </Button>
      </Box>

      <DataTable
        data={filteredTasks}
        columns={columns}
        searchFields={["title", "description"]}
        filterOptions={filterOptions}
        actions={actions}
        title="All Tasks"
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, task: null, formData: {} })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
              value={editDialog.formData.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              fullWidth
            />

            <TextField
              label="Description"
              value={editDialog.formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editDialog.formData.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                label="Status"
              >
                <MenuItem value="todo">Todo</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={editDialog.formData.assignedTo}
                onChange={(e) => handleFormChange("assignedTo", e.target.value)}
                label="Assigned To"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {users.map((user) => (
                  <MenuItem
                    key={user.uid || user.id}
                    value={user.uid || user.id}
                  >
                    {user.displayName || user.email || user.uid || user.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={
                editDialog.formData.dueDate
                  ? new Date(editDialog.formData.dueDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) => handleFormChange("dueDate", e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setEditDialog({ open: false, task: null, formData: {} })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, task: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            {`Are you sure you want to delete the task "${deleteDialog.task?.title}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, task: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.task)}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
