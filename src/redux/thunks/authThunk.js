import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";

export const signup = createAsyncThunk(
  "auth/signUp",
  async ({ email, password, username }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user in Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        username: username || null,
      };

      await setDoc(doc(db, "users", user.uid), userData);

      // Fetch the full data with timestamps resolved (optional)
      const userSnapshot = await getDoc(doc(db, "users", user.uid));
      const fullUserData = { uid: user.uid, ...userSnapshot.data() };

      // Persist in localStorage
      localStorage.setItem("user", JSON.stringify(fullUserData));

      toast.success("Signup successful!");
      return fullUserData;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const signin = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch the full user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        throw new Error("User data not found in Firestore");
      }

      const userData = { uid: user.uid, ...userSnapshot.data() };

      // Persist in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Sign-in successful!");
      return userData;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const signout = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      toast.success("Sign-out successful!");

      localStorage.removeItem("user");
      return null;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);
