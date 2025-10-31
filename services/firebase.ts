import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFYvzKavhrf4bnoFI0GckLk-dO40_ftJ4",
  authDomain: "eliran-apps.firebaseapp.com",
  projectId: "eliran-apps",
  storageBucket: "eliran-apps.appspot.com",
  messagingSenderId: "383762752947",
  appId: "1:383762752947:web:5885659b16d45793f557c6",
  measurementId: "G-DN1KK3CQZ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
