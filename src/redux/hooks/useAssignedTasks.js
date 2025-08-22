"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export function useAssignedTasks(uid) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const q = query(collection(db, "tasks"), where("assignedTo", "==", uid));

        const unsubscribe = onSnapshot(
            q, 
            (snapshot) => {
                const list = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate?.() || null,
                    dueDate: doc.data().dueDate?.toDate?.() || doc.data().dueDate || null,
                }));
                setTasks(list);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching assigned tasks:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    return { tasks, loading, error };
}
