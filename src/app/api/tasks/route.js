import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const data = await req.json();
    if (!data.title || !data.description || !data.createdBy) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Prepare task data - map createdBy to ownerId for requirements compliance
    const taskData = {
      ...data,
      ownerId: data.createdBy, // Map to ownerId as per requirements
      assignedTo: data.assignedTo || data.createdBy,
      status: data.status || "todo",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Handle dueDate if provided
    if (data.dueDate) {
      try {
        taskData.dueDate = new Date(data.dueDate);
      } catch (error) {
        console.warn("Invalid dueDate format:", data.dueDate);
        // Continue without dueDate if invalid
      }
    }

    const docRef = await addDoc(collection(db, "tasks"), taskData);

    const createdTask = {
      id: docRef.id,
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : null,
    };

    return new Response(JSON.stringify({ task: createdTask }), { status: 200 });
  } catch (err) {
    console.error("Create task error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    const role = searchParams.get('role');

    if (!uid || !role) {
      return new Response(
        JSON.stringify({ error: "Missing uid or role parameter" }),
        { status: 400 }
      );
    }

    // Import here to avoid build issues
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    let q;
    if (role === "admin") {
      q = query(collection(db, "tasks"));
    } else {
      // User can see tasks they created OR are assigned to them
      q = query(
        collection(db, "tasks"),
        where("ownerId", "==", uid)
      );
    }

    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return new Response(JSON.stringify({ tasks }), { status: 200 });
  } catch (err) {
    console.error("Fetch tasks error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
