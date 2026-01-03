import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAbXtYlzXUPK3VIO5Rxy5fnWKsisZA60PM",
  authDomain: "libratech-9092b.firebaseapp.com",
  projectId: "libratech-9092b",
  storageBucket: "libratech-9092b.firebasestorage.app",
  messagingSenderId: "189633471384",
  appId: "1:189633471384:web:fa6055bc3808027b7241ed",
  measurementId: "G-8JSYJBVNJP"
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Servisleri dışa aktar
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();