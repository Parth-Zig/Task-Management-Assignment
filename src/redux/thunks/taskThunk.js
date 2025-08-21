import { auth, db } from "@/src/lib/firebase";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { collection, query, where, getDocs } from "firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async ({ uid, role }, thunkAPI) => {
    try {
      let q;

      if (role === "user") {
        // Tasks owned by or assigned to user
        q = query(collection(db, "tasks"), where("assignedTo", "==", uid));
      } else {
        // Admin: fetch all tasks
        q = query(collection(db, "tasks"));
      }

      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || null,
          dueDate: data.dueDate?.toDate?.() || null,
        };
      });

      return tasks;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async ({ title, description, assignedTo, userId }, thunkAPI) => {
    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        createdBy: userId, // ✅ use userId here
        title,
        description,
        assignedTo: assignedTo || null,
        status: "pending",
      });

      return {
        id: docRef.id,
        createdBy: userId, // must match
        title,
        description,
        assignedTo,
        status: "pending",
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, updatedData, createdById }, thunkAPI) => {
    try {
      const currentUserId = auth.currentUser?.uid;

      if (!currentUserId) throw new Error("User not authenticated");

      if (currentUserId !== createdById) {
        throw new Error(
          "Permission denied: You can only update your own tasks."
        );
      }

      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });

      return { id, ...updatedData };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async ({ id, createdById }, thunkAPI) => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) throw new Error("User not authenticated");

      if (currentUserId !== createdById) {
        throw new Error(
          "Permission denied: You can only delete your own tasks."
        );
      }

      const taskRef = doc(db, "tasks", id);
      await deleteDoc(taskRef);

      return id; // return only ID to remove from Redux state
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
