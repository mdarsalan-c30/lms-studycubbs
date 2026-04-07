import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYK3-y01q4G613EWVk8fXAEIMpwLlrx-Y",
  authDomain: "trialleads-cc2e7.firebaseapp.com",
  projectId: "trialleads-cc2e7",
  storageBucket: "trialleads-cc2e7.firebasestorage.app",
  messagingSenderId: "58223233974",
  appId: "1:58223233974:web:4dab1513552ef260d04f17",
  measurementId: "G-0D7XTDHD5E"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
