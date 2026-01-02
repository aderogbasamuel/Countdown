/* ======================
   COUNTDOWN LOGIC
====================== */

const countdownEl = document.getElementById("countdown");
const examDate = new Date("March 12, 2026 00:00:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = examDate - now;

  if (diff <= 0) {
    countdownEl.textContent = "EXAM TIME";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownEl.textContent =
    `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ======================
   LOCAL STORAGE LOCK
====================== */

const buttons = document.querySelectorAll(".options button");
const feedback = document.getElementById("feedback");
const storedChoice = localStorage.getItem("exam_readiness");

if (storedChoice) lockSelection();

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (localStorage.getItem("exam_readiness")) return;

    const level = btn.dataset.level;
    localStorage.setItem("exam_readiness", level);
    lockSelection();
    sendToBackend(level);
  });
});

function lockSelection() {
  buttons.forEach(b => b.disabled = true);
  feedback.textContent = "Your response has been recorded.";
  feedback.classList.add("show");
}

/* ======================
   FIREBASE BACKEND
====================== */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  doc,
  updateDoc,
  increment,
  onSnapshot
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔴 REPLACE WITH YOUR OWN FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyCnK1EjSHuj46RNS2PYW9oocdKOsGDrXG4",
  authDomain: "exam-countdown-d959a.firebaseapp.com",
  projectId: "exam-countdown-d959a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const statsRef = doc(db, "readinessStats", "counts");

async function sendToBackend(level) {
  await updateDoc(statsRef, {
    [level]: increment(1)
  });
}

/* ======================
   LIVE COUNTS
====================== */

onSnapshot(statsRef, (docSnap) => {
  if (!docSnap.exists()) return;

  const data = docSnap.data();
  Object.keys(data).forEach(key => {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = data[key];
  });
});