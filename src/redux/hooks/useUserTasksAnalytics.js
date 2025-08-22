"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export function useUserTasksAnalytics(uid) {
  const [created, setCreated] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const createdQ = query(
      collection(db, "tasks"),
      where("createdBy", "==", uid)
    );
    const assignedQ = query(
      collection(db, "tasks"),
      where("assignedTo", "==", uid)
    );

    const unsubCreated = onSnapshot(
      createdQ,
      (snap) => {
        setCreated(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error("Error fetching created tasks:", err);
        setError(err.message);
      }
    );

    const unsubAssigned = onSnapshot(
      assignedQ,
      (snap) => {
        setAssigned(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching assigned tasks:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubCreated();
      unsubAssigned();
    };
  }, [uid]);

  const mapStatus = (status) => {
    if (status === "done") return "done";
    if (status === "in-progress") return "in-progress";
    return "todo";
  };

  const aggregateByStatus = (list) => {
    return list.reduce(
      (acc, t) => {
        const key = mapStatus(t.status);
        acc[key] += 1;
        return acc;
      },
      { todo: 0, "in-progress": 0, done: 0 }
    );
  };

  const stats = {
    createdCount: created.length,
    assignedCount: assigned.length,
    createdByStatus: aggregateByStatus(created),
    assignedByStatus: aggregateByStatus(assigned),
  };

  return { created, assigned, stats, loading, error };
}
