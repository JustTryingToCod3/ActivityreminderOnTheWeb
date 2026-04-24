let tracking = false;
let steps = 0;
let lastMove = 0;
let lastMovementTime = Date.now();
let startTime = Date.now();

let exercise = null;
let count = 0;

let wobbleCooldown = false;
let movePromptShown = false;

// NAV
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goHome() {
  exercise = null;
  showScreen("homeScreen");
}

function showActivities() {
  showScreen("activityScreen");
}

// CLEAR DATA
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

  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then(p => {
      if (p === "granted") startSensors();
    });
  } else startSensors();
}

function stopTracking() {
  tracking = false;
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

  if (mag > 11 && mag < 20 && now - lastMove > 400) {
    steps++;
    lastMove = now;
    lastMovementTime = now;

    document.getElementById("steps").innerText = "Steps: " + steps;
    document.getElementById("status").innerText = "🚶 Moving";
    document.body.className = "moving";
  }

  if (exercise && mag > 14 && now - lastMove > 400) {
    count++;
    lastMove = now;

    document.getElementById("counter").innerText = count + " / 10";

    if (count >= 10) finishExercise();
  }
}

// WOBBLE (NO SPAM)
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

  if (inactive > 5) {
    document.getElementById("status").innerText = "🪑 Still";
    document.body.className = "still";
  }

  // ONLY AFTER 5 MINUTES
  if (inactive > 300 && !movePromptShown) {
    movePromptShown = true;
    if (confirm("Move a little?")) movePromptShown = false;
  }

}, 1000);

// EXERCISES
function startExercise(type) {
  exercise = type;
  count = 0;

  document.getElementById("exerciseTitle").innerText = type;
  document.getElementById("counter").innerText = "0 / 10";

  showScreen("exerciseScreen");
}

// 🎉 BIG FINISH
function finishExercise() {
  let msg = document.createElement("div");

  msg.innerHTML = "🎉 YAAAAAYYYYYY <br> Congrats YOU DID IT!!!!!";
  msg.style.position = "fixed";
  msg.style.top = "40%";
  msg.style.left = "50%";
  msg.style.transform = "translate(-50%, -50%)";
  msg.style.background = "white";
  msg.style.padding = "20px";
  msg.style.borderRadius = "15px";
  msg.style.fontSize = "20px";

  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 3000);

  if (!confirm("Continue?")) goHome();
  else count = 0;
}

// STRETCH FLOW
let stretchSteps = [
  "Touch your toes",
  "Breathe in 4 sec, hold 4 sec, out 4 sec",
  "Standing twist",
  "Arm stretch"
];

let stretchIndex = 0;

function startStretch() {
  stretchIndex = 0;
  showScreen("exerciseScreen");
  updateStretch();
}

function updateStretch() {
  document.getElementById("exerciseTitle").innerText = "Stretch";
  document.getElementById("exerciseStatus").innerText = stretchSteps[stretchIndex];
}

function beginStretchStep() {
  let time = 30;

  let interval = setInterval(() => {
    time--;
    document.getElementById("exerciseStatus").innerText =
      stretchSteps[stretchIndex] + " - " + time + "s";

    if (time <= 0) {
      clearInterval(interval);

      alert("GREAT JOB!!!");

      stretchIndex++;

      if (stretchIndex >= stretchSteps.length) {
        alert("🎉 HORAAAYYYY YAAAY YOU DID IT!!!!");
        goHome();
      } else {
        updateStretch();
      }
    }

  }, 1000);
}
