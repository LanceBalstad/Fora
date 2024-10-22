// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBj4x1zXFygiYwm2PuNOZfjfRBoUaZemjc",
  authDomain: "fora-dd9cb.firebaseapp.com",
  projectId: "fora-dd9cb",
  storageBucket: "fora-dd9cb.appspot.com",
  messagingSenderId: "437634802682",
  appId: "1:437634802682:web:809321c05a5d81bcc23a43",
  measurementId: "G-87DZK3TX9Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
