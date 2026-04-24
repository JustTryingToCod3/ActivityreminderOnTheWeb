let mode = "idle"; // tracking | exercise | stretch

let tracking = false;
let steps = 0;
let lastMove = 0;
let lastMovementTime = Date.now();
let startTime = Date.now();

let count = 0;
let exerciseType = "";

let wobbleCooldown = false;
let movePromptShown = false;

let paused = false;

// stretch
let stretchIndex = 0;
let stretchTimer = null;

const stretches = [
  "Touch your toes",
  "Reach up: in 4s, hold 4s, out 4s",
  "Standing twist",
  "Arm stretch"
];

// NAV
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goHome() {
  mode = "idle";
  count = 0;
  clearInterval(stretchTimer);
  showScreen("homeScreen");
}

function showActivities() {
  showScreen("activityScreen");
}

// CLEAR
function clearData() {
  steps = 0;
  startTime = Date.now();
  document.getElementById("steps").innerText = "Steps: 0";
  document.getElementById("timer").innerText = "Time: 0s";
  document.getElementById("status").innerText = "Status: Waiting...";
}

// TRACKING
function startTracking() {
  if (tracking) return;
  tracking = true;
  mode = "tracking";

  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then(p => {
      if (p === "granted") startSensors();
    });
  } else startSensors();
}

function stopTracking() {
  tracking = false;
  mode = "idle";
  window.removeEventListener("devicemotion", handleMotion);
  window.removeEventListener("deviceorientation", handleOrientation);
}

function startSensors() {
  window.addEventListener("devicemotion", handleMotion);
  window.addEventListener("deviceorientation", handleOrientation);
}

// MOTION
function handleMotion(e) {
  if (!tracking) return;

  let acc = e.accelerationIncludingGravity;
  if (!acc) return;

  let mag = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
  let now = Date.now();

  // tracking steps
  if (mode === "tracking" && mag > 11 && now - lastMove > 400) {
    steps++;
    lastMove = now;
    lastMovementTime = now;

    document.getElementById("steps").innerText = "Steps: " + steps;
    document.getElementById("status").innerText = "🚶 Moving";
    document.body.className = "moving";
  }

  // exercise reps
  if (mode === "exercise" && mag > 14 && now - lastMove > 400) {
    count++;
    lastMove = now;

    document.getElementById("counter").innerText = count + " / 10";

    if (count >= 10) finishExercise();
  }
}

// WOBBLE (no spam)
function handleOrientation(e) {
  if (!tracking) return;

  if ((Math.abs(e.beta) > 45 || Math.abs(e.gamma) > 45) && !wobbleCooldown) {
    wobbleCooldown = true;
    document.getElementById("status").innerText =
      "⚠️ You seem wobbly. Sit down?";

    setTimeout(() => wobbleCooldown = false, 5000);
  }
}

// TIMER
setInterval(() => {
  let t = Math.floor((Date.now() - startTime)/1000);
  document.getElementById("timer").innerText = "Time: " + t + "s";

  let inactive = (Date.now() - lastMovementTime)/1000;

  if (inactive > 5 && mode === "tracking") {
    document.getElementById("status").innerText = "🪑 Still";
    document.body.className = "still";
  }

  if (inactive > 300 && !movePromptShown) {
    movePromptShown = true;
    confirm("Move a little?");
  }
}, 1000);

// EXERCISE
function startExercise(type) {
  mode = "exercise";
  exerciseType = type;
  count = 0;

  document.getElementById("exerciseTitle").innerText = type;
  document.getElementById("counter").innerText = "0 / 10";
  document.getElementById("exerciseStatus").innerText = "Get ready...";

  showScreen("exerciseScreen");
}

function finishExercise() {
  showCongrats();

}

function showCongrats() {
  let msg = document.createElement("div");

  msg.innerHTML = "🎉 YAAAAAYYYYYY<br>Congrats YOU DID IT!!!!!";
  msg.style.position = "fixed";
  msg.style.top = "40%";
  msg.style.left = "50%";
  msg.style.transform = "translate(-50%, -50%)";
  msg.style.background = "white";
  msg.style.padding = "20px";
  msg.style.borderRadius = "15px";

  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// STRETCH
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
  if (mode === "stretch") runStretch();
}

function runStretch() {
  let time = 30;

  stretchTimer = setInterval(() => {
    if (!paused) {
      time--;
      document.getElementById("exerciseStatus").innerText =
        stretches[stretchIndex] + " - " + time + "s";
    }

    if (time <= 0) {
      clearInterval(stretchTimer);

      alert("GREAT JOB!!!");
      stretchIndex++;

      if (stretchIndex >= stretches.length) {
        alert("🎉 HORAAAYYYY YAAAY YOU DID IT!!!!");
        goHome();
      } else {
        updateStretch();
      }
    }
  }, 1000);
}

// PAUSE
function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").innerText =
    paused ? "Resume" : "Pause";
}
