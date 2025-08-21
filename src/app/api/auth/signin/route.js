import { NextResponse } from "next/server";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/lib/firebase";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Sign in user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    return NextResponse.json({
      success: true,
      user: { uid: user.uid, email: user.email },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
