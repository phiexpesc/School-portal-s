import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const studentsCollection = collection(db, "students");

export async function addStudent(student:any) {
  await addDoc(studentsCollection, student);
}

export async function getStudents() {
  const snapshot = await getDocs(studentsCollection);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
