"use client";
// here in task list i have add task and task card 
/* 
use firestore snapshot so i can see the live updates
*/
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { Grid, Typography, Box, CircularProgress, Alert, TextField, FormControl, InputLabel, Select, MenuItem, Paper, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import TaskBox from "@/src/components/TaskBox";
import TaskAdd from "@/src/components/TaskAdd";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export default function TaskList() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  // Use Firestore snapshot for real-time updates
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (!user) return;

    setLoading(true);
    setError("");

    let q;
    if (user.role === "admin") {
      q = query(collection(db, "tasks"));
    } else {
      q = query(collection(db, "tasks"), where("createdBy", "==", user.uid));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          dueDate: doc.data().dueDate?.toDate?.() || doc.data().dueDate || null,
        }));
        setTasks(tasksList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching tasks:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const refetchTasks = () => {};

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch = !s || [t.title, t.description, t.status, t.assignedTo].some((v) => String(v || "").toLowerCase().includes(s));
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const statusOptions = [
    { value: "", label: "All" },
    { value: "todo", label: "Todo" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Please sign in to view tasks.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Task List
      </Typography>

      {/* Filters Row */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            placeholder="Search tasks by title, description, assignee, status"
            label="Search"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tasks Grid */}
      {!loading && !error && (
        <Grid container spacing={3}>
          {/* Add Task Card */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Paper
              sx={{
                height: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "2px dashed",
                borderColor: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  backgroundColor: "action.hover",
                },
              }}
              onClick={() => setOpenAdd(true)}
            >
              <AddIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h6" color="primary.main">
                Add Task
              </Typography>
            </Paper>
          </Grid>

          {/* Task Cards */}
          {filtered.map((task) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={task.id}>
              <TaskBox
                data={task}
                refetchTasks={refetchTasks}
                readOnly={false}
                statusEditable={true}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Task Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Add New Task
            <IconButton onClick={() => setOpenAdd(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TaskAdd
            onSuccess={() => {
              setOpenAdd(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
