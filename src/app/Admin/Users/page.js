"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Typography, Box, LinearProgress } from "@mui/material";
import DataTable from "@/src/components/DataTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const columns = [
    { key: "displayName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", type: "status" },
    { key: "uid", label: "User ID" },
    { key: "createdAt", label: "Created Date", type: "date" },
  ];

  const filterOptions = [
    {
      key: "role",
      label: "Role",
      values: ["admin", "user"],
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        User Management
      </Typography>

      <DataTable
        data={users}
        columns={columns}
        searchFields={["displayName", "email", "role", "uid"]}
        filterOptions={filterOptions}
        title="All Users"
      />
    </>
  );
}


