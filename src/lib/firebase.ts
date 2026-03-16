import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBN-EdkB55wZERcSG_a3VIWu4Kg8caQu7A",
  authDomain: "azmovie-cloud.firebaseapp.com",
  projectId: "azmovie-cloud",
  storageBucket: "azmovie-cloud.firebasestorage.app",
  messagingSenderId: "505489860753",
  appId: "1:505489860753:web:dc6579c539ed5646633730"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
