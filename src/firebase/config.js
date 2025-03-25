// Configuración de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyADyZJx-Tv5ziq2dfGZfK2x_fDz1KHolKs",
  authDomain: "pruebarezs.firebaseapp.com",
  projectId: "pruebarezs",
  storageBucket: "pruebarezs.firebasestorage.app",
  messagingSenderId: "883823775330",
  appId: "1:883823775330:web:a75302a8f614043bcc4b3b",
  measurementId: "G-D7P6GTED94"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };