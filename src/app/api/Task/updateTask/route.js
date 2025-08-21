import { db } from "@/src/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const { id, updates } = await req.json();
    if (!id || !updates)
      return new Response(
        JSON.stringify({ error: "Missing task ID or updates" }),
        { status: 400 }
      );

    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { ...updates, updatedAt: serverTimestamp() });

    return new Response(
      JSON.stringify({ message: "Task updated successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Update task error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
