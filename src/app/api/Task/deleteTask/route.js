import { db } from "@/src/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id)
      return new Response(JSON.stringify({ error: "Missing task ID" }), {
        status: 400,
      });

    await deleteDoc(doc(db, "tasks", id));

    return new Response(
      JSON.stringify({ message: "Task deleted successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Delete task error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
