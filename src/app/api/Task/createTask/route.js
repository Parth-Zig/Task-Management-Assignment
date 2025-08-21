import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const data = await req.json();
    if (!data.title || !data.description || !data.assignedTo) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, "tasks"), {
      ...data,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const createdTask = {
      id: docRef.id,
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ task: createdTask }), { status: 200 });
  } catch (err) {
    console.error("Create task error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
