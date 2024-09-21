import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmZbBavouS-2qtWTx-sB1w42FpdSWUD2M",
  authDomain: "rnfirebase-b68b4.firebaseapp.com",
  projectId: "rnfirebase-b68b4",
  storageBucket: "rnfirebase-b68b4.appspot.com",
  messagingSenderId: "506055303239",
  appId: "1:506055303239:web:d01b67191caad3f4de1162",
  measurementId: "G-6MN84Q8RF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };