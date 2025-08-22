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

  const stats = {
    totalTasks: tasks.length,
    totalUsers: users.length,
    tasksByStatus: {
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    },
    usersByRole: {
      admin: users.filter((u) => u.role === "admin").length,
      user: users.filter((u) => u.role === "user" || !u.role).length,
    },
    overdueTasks: tasks.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const now = new Date();
      return due < now && t.status !== "complete";
    }).length,
  };

  return {
    tasks,
    users,
    stats,
    loading,
  };
}
