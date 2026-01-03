// static/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Your Firebase configuration provided previously
const firebaseConfig = {
  apiKey: "AIzaSyAulr_p4CzZvbnuoezNPX_y2UdKCacv9CI",
  authDomain: "health-care-chatbot-40435.firebaseapp.com",
  projectId: "health-care-chatbot-40435",
  storageBucket: "health-care-chatbot-40435.appspot.com",
  messagingSenderId: "922882672595",
  appId: "1:922882672595:web:0ee8e9c2654c2c2e1ad126",
  measurementId: "G-CBPYRX751B"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);