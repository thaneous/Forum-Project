// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA39coVHSYwAeVLpT1rSs96fHwGcIb5LKU",
  authDomain: "forum-team5.firebaseapp.com",
  projectId: "forum-team5",
  storageBucket: "forum-team5.firebasestorage.app",
  messagingSenderId: "253092385737",
  appId: "1:253092385737:web:96eec92df516f1f0894e18",
  databaseURL:
    "https://forum-team5-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// the Firebase authentication handler
export const auth = getAuth(app);
// the Realtime Database handler
export const db = getDatabase(app);
