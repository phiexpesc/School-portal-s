import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const gradesCollection = collection(db, "grades");

export async function addGrade(grade:any) {
  await addDoc(gradesCollection, grade);
}

export async function getGrades() {
  const snapshot = await getDocs(gradesCollection);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
