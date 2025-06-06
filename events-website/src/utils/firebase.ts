
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "events-app-5be70.firebaseapp.com",
  projectId: "events-app-5be70",
  storageBucket: "events-app-5be70.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDERKEY,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASEMEASID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use getAuth instead of initializeAuth for better persistence
export const auth = getAuth(app);