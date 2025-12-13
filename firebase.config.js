// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDVpKYcs4Qvkx96zy34oWQR7BElUxm9t0",
  authDomain: "project-4ee55.firebaseapp.com",
  projectId: "project-4ee55",
  storageBucket: "project-4ee55.firebasestorage.app",
  messagingSenderId: "820537993234",
  appId: "1:820537993234:web:09be3a85c3776a8d6350cb",
  measurementId: "G-VKR42L86XW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);