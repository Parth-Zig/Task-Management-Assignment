import { db } from "@/src/lib/firebase";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const updates = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "Task ID is required" }), {
        status: 400,
      });
    }

    // it solved build issue :)
    const { doc, updateDoc } = await import("firebase/firestore");

    await updateDoc(doc(db, "tasks", id), {
      ...updates,
      updatedAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Update task error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: "Task ID is required" }), {
        status: 400,
      });
    }

    // Import here to avoid build issues
    const { doc, deleteDoc } = await import("firebase/firestore");

    await deleteDoc(doc(db, "tasks", id));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Delete task error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
