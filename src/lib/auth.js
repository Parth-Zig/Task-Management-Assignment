import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export async function logoutUser() {
  try {
    await signOut(auth);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    return { success: false, error: error.message };
  }
}
