import { db } from "@/src/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const role = searchParams.get("role");

    let q;

    if (role === "user") {
      q = query(collection(db, "tasks"), where("createdBy", "==", uid));
    } else {
      q = collection(db, "tasks"); // fetch all
    }

    const snapshot = await getDocs(q);

    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      dueDate: doc.data().dueDate?.toDate?.() || null,
    }));

    return new Response(JSON.stringify({ tasks }), { status: 200 });
  } catch (err) {
    console.error("Firestore fetch error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
