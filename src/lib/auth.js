import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Fetch user profile from Firestore to get role and other details
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return { 
          success: true, 
          user: { 
            uid: user.uid, 
            email: user.email,
            displayName: userData.displayName || "",
            role: userData.role || "user",
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          } 
        };
      } else {
        // User document doesn't exist, create a default one
        return { 
          success: true, 
          user: { 
            uid: user.uid, 
            email: user.email,
            displayName: "",
            role: "user"
          } 
        };
      }
    } catch (firestoreError) {
      console.error("Error fetching user profile:", firestoreError);
      // Fallback to basic user info if Firestore fails
      return { 
        success: true, 
        user: { 
          uid: user.uid, 
          email: user.email,
          displayName: "",
          role: "user"
        } 
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  try {
    // Sign out from Firebase Auth
    await signOut(auth);
    
    // Clear local storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Clear any other stored data
    sessionStorage.clear();
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Even if Firebase signout fails, clear local data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    return { success: false, error: error.message };
  }
}
