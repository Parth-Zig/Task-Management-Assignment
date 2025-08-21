import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    return { success: true, user: { uid: user.uid, email: user.email } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
