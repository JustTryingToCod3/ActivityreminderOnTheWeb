let mode = "idle";
let tracking = false;
let steps = 0;
let lastMove = 0;
let lastMovementTime = Date.now();
let startTime = Date.now();

let count = 0;
let paused = false;

let wobbleCooldown = false;
let movePromptShown = false;

let stretchIndex = 0;
let stretchTimer = null;

const stretches = [
  "Touch your toes",
  "Breathe: in 4s, hold 4s, out 4s",
  "Standing twist",
  "Arm stretch"
];

// -------- NAV --------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goHome() {
  mode = "idle";
  clearInterval(stretchTimer);
  showScreen("homeScreen");
}

// -------- DATA --------
function clearData() {
  steps = 0;
  startTime = Date.now();
  updateUI();
}

// -------- TRACKING --------
function startTracking() {
  // clean restart every time
  stopTracking();

  tracking = true;
  mode = "tracking";
  movePromptShown = false;

  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then(p => {
      if (p === "granted") attachSensors();
    });
  } else {
    attachSensors();
  }
}

function stopTracking() {
  tracking = false;
  mode = "idle";

  window.removeEventListener("devicemotion", handleMotion);
  window.removeEventListener("deviceorientation", handleOrientation);

  document.body.className = "";
  document.getElementById("status").innerText = "Stopped";
}

function attachSensors() {
  window.addEventListener("devicemotion", handleMotion);
  window.addEventListener("deviceorientation", handleOrientation);
}

// -------- MOTION --------
function handleMotion(e) {
  if (!tracking || paused) return;

  const acc = e.accelerationIncludingGravity;
  if (!acc) return;

  const mag = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
  const now = Date.now();

  if (mag > 11 && now - lastMove > 400) {
    lastMove = now;
    lastMovementTime = now;

    if (mode === "tracking") {
      steps++;
      document.body.className = "moving";
      document.getElementById("status").innerText = "🚶 Moving";
      updateUI();
    }

    if (mode === "exercise") {
      count++;
      document.getElementById("counter").innerText = `${count} / 10`;
      if (count >= 10) finishExercise();
    }
  }
}

// -------- WOBBLE --------
function handleOrientation(e) {
  if (!tracking) return;

  if ((Math.abs(e.beta) > 45 || Math.abs(e.gamma) > 45) && !wobbleCooldown) {
    wobbleCooldown = true;
    document.getElementById("status").innerText = "⚠️ You seem wobbly";

    setTimeout(() => wobbleCooldown = false, 4000);
  }
}

// -------- TIMER --------
setInterval(() => {
  const t = Math.floor((Date.now() - startTime)/1000);
  document.getElementById("timer").innerText = `Time: ${t}s`;

  const inactive = (Date.now() - lastMovementTime)/1000;

  if (inactive > 5 && mode === "tracking") {
    document.body.className = "still";
    document.getElementById("status").innerText = "🪑 Still";
  }

  if (inactive > 300 && !movePromptShown) {
    movePromptShown = true;
    confirm("Move a little?");
  }
}, 1000);

// -------- EXERCISE --------
function startExercise(type) {
  mode = "exercise";
  count = 0;

  document.getElementById("exerciseTitle").innerText = type;
  document.getElementById("counter").innerText = "0 / 10";
  document.getElementById("exerciseStatus").innerText = "Get ready...";

  showScreen("exerciseScreen");
}

function finishExercise() {
  showCongrats();
  count = 0;
}

function showCongrats() {
  const el = document.createElement("div");
  el.innerHTML = "🎉 YAAAAAYYYYYY<br>Congrats YOU DID IT!!!!!";
  Object.assign(el.style, {
    position: "fixed",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    padding: "20px",
    borderRadius: "15px"
  });

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// -------- STRETCH --------
function startStretch() {
  mode = "stretch";
  stretchIndex = 0;
  showScreen("exerciseScreen");
  updateStretch();
}

function updateStretch() {
  document.getElementById("exerciseTitle").innerText = "Stretch";
  document.getElementById("counter").innerText = "";
  document.getElementById("exerciseStatus").innerText = stretches[stretchIndex];
}

function beginAction() {
  if (mode !== "stretch") return;

  let time = 30;
  clearInterval(stretchTimer);

  stretchTimer = setInterval(() => {
    if (!paused) {
      time--;
      document.getElementById("exerciseStatus").innerText =
        `${stretches[stretchIndex]} - ${time}s`;
    }

    if (time <= 0) {
      clearInterval(stretchTimer);
      alert("GREAT JOB!!!");

      stretchIndex++;
      if (stretchIndex >= stretches.length) {
        alert("🎉 YOU DID IT!!!!");
        goHome();
      } else {
        updateStretch();
      }
    }
  }, 1000);
}

// -------- PAUSE --------
function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").innerText = paused ? "Resume" : "Pause";
}

// -------- UI --------
function updateUI() {
  document.getElementById("steps").innerText = `Steps: ${steps}`;
}
