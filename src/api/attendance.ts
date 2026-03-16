import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const attendanceCollection = collection(db, "attendance");

export async function addAttendance(record:any) {
  await addDoc(attendanceCollection, record);
}

export async function getAttendance() {
  const snapshot = await getDocs(attendanceCollection);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
