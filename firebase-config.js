// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8e4Pjs54YNZt-wbmHD74-R_jJAvX_oak",
  authDomain: "family-budget-96e32.firebaseapp.com",
  projectId: "family-budget-96e32",
  storageBucket: "family-budget-96e32.firebasestorage.app",
  messagingSenderId: "476844522968",
  appId: "1:476844522968:web:107c5ed733d7216ddd06ad",
  measurementId: "G-7ZND391346"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
