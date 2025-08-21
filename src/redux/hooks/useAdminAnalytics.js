"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export function useAdminAnalytics() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tasksQuery = query(collection(db, "tasks"));
    const usersQuery = query(collection(db, "users"));

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        dueDate: doc.data().dueDate?.toDate?.() || doc.data().dueDate || null,
      }));
      setTasks(tasksList);
    });

    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    });

    setLoading(false);

    return () => {
      unsubTasks();
      unsubUsers();
    };
  }, []);

  // Calculate comprehensive statistics
  const stats = {
    totalTasks: tasks.length,
    totalUsers: users.length,
    tasksByStatus: {
      todo: tasks.filter(t => t.status === "todo").length,
      "in-progress": tasks.filter(t => t.status === "in-progress").length,
      done: tasks.filter(t => t.status === "done").length,
    },
    usersByRole: {
      admin: users.filter(u => u.role === "admin").length,
      user: users.filter(u => u.role === "user" || !u.role).length,
    },
    recentTasks: tasks
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 5),
    overdueTasks: tasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const now = new Date();
      return due < now && t.status !== "complete";
    }).length,
  };

  // Calculate completion rate
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.tasksByStatus.complete / stats.totalTasks) * 100)
    : 0;

  // Calculate average tasks per user
  const avgTasksPerUser = stats.totalUsers > 0 
    ? Math.round((stats.totalTasks / stats.totalUsers) * 10) / 10
    : 0;

  return {
    tasks,
    users,
    stats,
    completionRate,
    avgTasksPerUser,
    loading,
  };
}
