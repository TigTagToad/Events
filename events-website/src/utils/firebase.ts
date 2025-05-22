// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoNwVUz_qoppTcqwBL8XqkUJzdOF9JQtc",
  authDomain: "events-app-5be70.firebaseapp.com",
  projectId: "events-app-5be70",
  storageBucket: "events-app-5be70.firebasestorage.app",
  messagingSenderId: "389607520199",
  appId: "1:389607520199:web:658e4c87ec1aeee2124be2",
  measurementId: "G-KMXL2GB3CH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);