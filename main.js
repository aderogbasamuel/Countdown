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
   RESPONSES (ROAST + MOTIVATION)
====================== */

const responses = {
  not_ready: [
    "You still have time… but time is running faster than you think 😭",
    "At this point, your textbook is still a stranger.",
    "No pressure, but the exam is not waiting for motivation.",
    "Hope is not a strategy. Start now."
  ],
  slightly_ready: [
    "Okay… at least you opened the book once.",
    "Small progress is still progress. Push harder.",
    "You’ve started — now don’t stop.",
    "You know some things… but do you know enough?"
  ],
  moderately_ready: [
    "You’re doing well. Consistency will save you.",
    "This is the dangerous zone — don’t relax now.",
    "Keep revising. Confidence comes from repetition.",
    "You’re closer than you think."
  ],
  fully_ready: [
    "Calm down academic weapon 😎",
    "Revision mode activated. Respect.",
    "You’ve done your part. Stay sharp.",
    "Confidence backed by preparation — love to see it."
  ]
};

function getRandomResponse(level) {
  const list = responses[level];
  return list[Math.floor(Math.random() * list.length)];
}

/* ======================
   LOCAL STORAGE LOCK
====================== */

const buttons = document.querySelectorAll(".options button");
const feedback = document.getElementById("feedback");
const storedChoice = localStorage.getItem("exam_readiness");

if (storedChoice) {
  lockSelection(storedChoice);
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (localStorage.getItem("exam_readiness")) return;
    
    const level = btn.dataset.level;
    localStorage.setItem("exam_readiness", level);
    
    lockSelection(level);
    sendToBackend(level);
  });
});

function lockSelection(level) {
  buttons.forEach(b => b.disabled = true);
  
  const message = getRandomResponse(level);
  feedback.textContent = message;
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
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  
  Object.keys(data).forEach(key => {
    const countEl = document.getElementById(`count-${key}`);
    const barEl = document.getElementById(`bar-${key}`);
    
    if (!countEl || !barEl) return;
    
    countEl.textContent = data[key];
    
    const percent = total === 0 ? 0 : (data[key] / total) * 100;
    barEl.style.width = percent + "%";
  });
});