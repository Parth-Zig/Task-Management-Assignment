"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import TaskBox from "@/src/components/TaskBox";
import TaskAdd from "@/src/components/TaskAdd";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { STATUS_OPTIONS } from "@/src/components/constants";

export default function TaskList() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  let theme = useTheme();
  let smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  useEffect(() => {
    if (authLoading) return;
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

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesSearch =
        !s ||
        [t.title, t.description, t.status, t.assignedTo].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(s)
        );
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Task List
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          placeholder="Search tasks by Title, Description"
          label="Search"
          sx={{ flex: 1, height: "56px" }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem key={"All"} value="">
              All
            </MenuItem>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Tasks Grid */}
      {!loading && !error && (
        <Grid container spacing={3}>
          {/* Add Task Card */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Box
              sx={{
                p: 0,
                width: "275px",
                height: "100%",
              }}
            >
              <Paper
                sx={{
                  height: "100%",
                  minHeight: "262px",
                  width: "100%",
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
            </Box>
          </Grid>

          {/* Task Cards */}
          {filtered.map((task) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={task.id}>
              <Box
                sx={{
                  p: 0,
                  width: "275px",
                  height: "100%",
                }}
              >
                <TaskBox data={task} readOnly={false} statusEditable={false} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Task Dialog */}
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        maxWidth="md"
        fullWidth
        fullScreen={smDown}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Add New Task
            <IconButton onClick={() => setOpenAdd(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
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
