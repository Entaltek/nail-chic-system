import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAJlz4bQfVrY9QBoH9Lr-wrdcLwB55ANDo",
  authDomain: "athleek-sys.firebaseapp.com",
  databaseURL: "https://athleek-sys-default-rtdb.firebaseio.com",
  projectId: "athleek-sys",
  storageBucket: "athleek-sys.firebasestorage.app",
  messagingSenderId: "587148598592",
  appId: "1:587148598592:web:904fe73541c18cdbe0aea5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;