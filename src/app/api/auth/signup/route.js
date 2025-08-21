import { NextResponse } from "next/server";
import { auth, db } from "@/src/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    let email, password;
    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    let userCredential;

    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (e) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 400 }
      );
    }

    const user = userCredential.user;

    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "user",
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 400 }
      );
    }

    let idToken = null;
    try {
      idToken = await user.getIdToken();
    } catch (e) {}

    return NextResponse.json({
      success: true,
      user: { uid: user.uid, email: user.email, role: "user" },
      idToken,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
