import { NextResponse } from "next/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {}

    if (!userCredential) {
      return NextResponse.json(
        {
          success: false,
          error: "This user is not registered in the system.",
        },
        { status: 403 }
      );
    }

    const user = userCredential?.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "This user is not registered in the system.",
        },
        { status: 403 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || "",
        role: userData.role || "user",
        createdAt: userData.createdAt || null,
        updatedAt: userData.updatedAt || null,
      },
    });
  } catch (error) {
    let status = 400;
    let message = "Login failed. Please check your credentials.";

    // Firebase auth error codes
    switch (error.code) {
      case "auth/invalid-email":
        message = "Invalid email address.";
        break;
      case "auth/user-not-found":
        message = "No account found with this email.";
        break;
      case "auth/wrong-password":
      case "auth/invalid-credential":
        message = "Incorrect email or password.";
        break;
      case "auth/user-disabled":
        message = "This user account has been disabled.";
        break;
      case "auth/too-many-requests":
        message = "Too many login attempts. Please try again later.";
        break;
      default:
        status = 500;
        message = "Server error. Please try again later.";
        break;
    }

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
