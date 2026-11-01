// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBirRdJPyr925gPISgD0ODm6BnJr8PoXEc",
  authDomain: "alg-geo-grinder.firebaseapp.com",
  projectId: "alg-geo-grinder",
  storageBucket: "alg-geo-grinder.firebasestorage.app",
  messagingSenderId: "792542759196",
  appId: "1:792542759196:web:29c3c039e136141617d2d9",
  measurementId: "G-NHRZV3XTB3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);