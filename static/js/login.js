// static/js/login.js
import { auth, db } from "./firebase.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { 
  setDoc, 
  doc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// UI Elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Switch between forms
document.getElementById("goRegister").onclick = () => {
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
};

document.getElementById("goLogin").onclick = () => {
  registerForm.classList.remove("active");
  loginForm.classList.add("active");
};

// ---------------- REGISTER LOGIC ----------------
document.getElementById("registerBtn").onclick = async () => {
  const name = document.getElementById("regName").value.trim();
  const age = document.getElementById("regAge").value.trim();
  const gender = document.getElementById("regGender").value;
  const profession = document.getElementById("regProfession").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const msg = document.getElementById("registerMsg");

  if (!name || !age || !gender || !profession || !email || !password) {
    msg.style.color = "red";
    msg.textContent = "Please fill all fields!";
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Send verification email
    await sendEmailVerification(userCred.user);

    // Save profile to Firestore
    await setDoc(doc(db, "users", userCred.user.uid), {
      name, age, gender, profession, email,
      createdAt: serverTimestamp(),
    });

    msg.style.color = "green";
    msg.textContent = "Success! Verification email sent. Please check your inbox.";
    
    setTimeout(() => {
      registerForm.classList.remove("active");
      loginForm.classList.add("active");
    }, 2500);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = error.message.replace("Firebase:", "");
  }
};

// ---------------- LOGIN LOGIC ----------------
document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const msg = document.getElementById("loginMsg");

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    if (!userCred.user.emailVerified) {
      msg.style.color = "red";
      msg.textContent = "Please verify your email before logging in.";
      return;
    }

    msg.style.color = "green";
    msg.textContent = "Login successful! Redirecting...";

    setTimeout(() => {
      window.location.replace("/chatbot"); // Redirects to the Flask route
    }, 1000);

  } catch (error) {
    msg.style.color = "red";
    msg.textContent = "Incorrect email or password!";
  }
};

// ---------------- PASSWORD RESET ----------------
document.getElementById("forgotPassword").onclick = async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const msg = document.getElementById("loginMsg");

  if (!email) {
    msg.style.color = "red";
    msg.textContent = "Please enter your email above first.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    msg.style.color = "green";
    msg.textContent = "Password reset email sent!";
  } catch (error) {
    msg.style.color = "red";
    msg.textContent = "Error: " + error.message.replace("Firebase:", "");
  }
};