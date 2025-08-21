"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Typography, Box, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Edit, Delete, Download } from "@mui/icons-material";
import DataTable from "@/src/components/DataTable";
import { toast } from "react-toastify";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({ open: false, task: null, formData: {} });

  useEffect(() => {
    // Fetch tasks
    const tasksQuery = query(collection(db, "tasks"));
    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTasks(data);
    });

    // Fetch users
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

  // Helper function to get user display name
  const getUserDisplayName = (userId) => {
    if (!userId) return "Unassigned";
    const user = users.find(u => u.uid === userId || u.id === userId);
    return user ? (user.displayName || user.email || userId) : userId;
  };

  // Transform tasks to show user names instead of UUIDs
  const transformedTasks = tasks.map(task => ({
    ...task,
    assignedToDisplay: getUserDisplayName(task.assignedTo),
    createdByDisplay: getUserDisplayName(task.createdBy),
  }));

  // Export tasks to CSV
  const exportToCSV = () => {
    if (transformedTasks.length === 0) {
      toast.warning("No tasks to export");
      return;
    }

    const headers = ["Title", "Description", "Status", "Assigned To", "Created By", "Created Date", "Due Date"];
    const csvData = transformedTasks.map(task => [
      task.title || "",
      task.description || "",
      task.status || "",
      task.assignedToDisplay || "",
      task.createdByDisplay || "",
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "",
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tasks_${new Date().toISOString().split('T')[0]}.csv`);
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

  const handleDelete = async (task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return;
    
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
    setEditDialog(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value }
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
      values: ["todo", "in-progress", "done"],
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
      onClick: handleDelete,
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" gutterBottom>
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
        data={transformedTasks}
        columns={columns}
        searchFields={["title", "description", "status", "assignedToDisplay", "createdByDisplay"]}
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
                  <MenuItem key={user.uid || user.id} value={user.uid || user.id}>
                    {user.displayName || user.email || user.uid || user.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, task: null, formData: {} })}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


