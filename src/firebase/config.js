import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD8aqBEGU-IRYnLjx4DyxPQx7RJohBlmhA",
  authDomain: "trans-all-in-one.firebaseapp.com",
  projectId: "trans-all-in-one",
  storageBucket: "trans-all-in-one.firebasestorage.app",
  messagingSenderId: "173849074834",
  appId: "1:173849074834:web:896d5f6e51bf21233a5a4b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
