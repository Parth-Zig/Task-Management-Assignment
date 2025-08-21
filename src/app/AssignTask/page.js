"use client";

/**
 * here i have task list which are assigned to me use firestore snapshot so i can see the live updates
 * also try to use same component as TaskList's task box for render the task but in this make status drop down selectable between three values
 * 
 * 
 * */

import { useAuth } from "@/src/hooks/useAuth";
import { useAssignedTasks } from "@/src/redux/hooks/useAssignedTasks";
import { Box, Typography, Grid, CircularProgress, Alert } from "@mui/material";
import TaskBox from "@/src/components/TaskBox";

export default function AssignTask() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading } = useAssignedTasks(user?.uid);

  // Function to handle refetch (no-op since we use snapshots)
  const handleRefetch = () => {
    // No need to manually refetch with snapshots
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tasks Assigned To Me
        </Typography>
        <Alert severity="info">Please sign in to view assigned tasks.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tasks Assigned To Me
      </Typography>
      
      {/* Loading State */}
      {tasksLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!tasksLoading && tasks.length === 0 && (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No tasks assigned to you yet.
          </Typography>
        </Box>
      )}

      {/* Tasks Grid */}
      {!tasksLoading && tasks.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <TaskBox 
                data={task} 
                refetchTasks={handleRefetch}
                readOnly={false}
                statusEditable={true}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
