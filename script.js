let tracking = false;
let steps = 0;
let lastMove = 0;
let lastMovementTime = Date.now();
let startTime = Date.now();

let exercise = null;
let count = 0;

let paused = false;
let stretchIndex = 0;
let stretchTimer = null;

// -------- NAV --------
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

// -------- TRACKING --------
function startTracking() {
  if (tracking) return;
  tracking = true;

  startTime = Date.now();

  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then(p => {
      if (p === "granted") startSensors();
    });
  } else {
    startSensors();
  }
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

// -------- MOTION --------
function handleMotion(e) {
  if (!tracking || paused) return;

  let acc = e.accelerationIncludingGravity;
  if (!acc) return;

  let mag = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
  let now = Date.now();

  // STEP DETECTION
  if (mag > 11 && mag < 20 && now - lastMove > 400) {
    steps++;
    lastMove = now;
    lastMovementTime = now;

    document.getElementById("steps").innerText = "Steps: " + steps;
    setMoving(true);
  }

  // EXERCISE
  if (exercise && mag > 14 && now - lastMove > 400) {
    count++;
    lastMove = now;

    document.getElementById("counter").innerText = count + " / 10";

    if (count >= 10) finishExercise();
  }
}

// -------- GYRO --------
function handleOrientation(e) {
  if (!tracking) return;

  if (Math.abs(e.beta) > 45 || Math.abs(e.gamma) > 45) {
    document.getElementById("status").innerText =
      "⚠️ You seem wobbly. Sit down?";
  }
}

// -------- STATE --------
function setMoving(val) {
  if (val) {
    document.getElementById("status").innerText = "🚶 Moving";
    document.body.className = "moving";
  } else {
    document.getElementById("status").innerText = "🪑 Still";
    document.body.className = "still";
  }
}

// -------- TIMER --------
setInterval(() => {
  let t = Math.floor((Date.now() - startTime)/1000);
  let el = document.getElementById("timer");
  if (el) el.innerText = "Time: " + t + "s";

  let inactive = (Date.now() - lastMovementTime)/1000;

  if (inactive > 5) setMoving(false);

  if (inactive > 30 && inactive < 31) {
    alert("Testing: you are still");
  }

  if (inactive > 60) {
    if (confirm("Would you like to move?")) {
      setMoving(true);
    }
  }

}, 1000);

// -------- EXERCISES --------
function startExercise(type) {
  exercise = type;
  count = 0;
  showScreen("exerciseScreen");

  document.getElementById("exerciseTitle").innerText = type;

  if (type === "stretch") startStretch();
}

function finishExercise() {
  alert("🎉 Great job!");
  if (!confirm("Continue?")) goHome();
  else count = 0;
}

// -------- STRETCH --------
let stretches = [
  "Touch toes",
  "Lunge left",
  "Lunge right",
  "Butterfly",
  "Arm stretch",
  "Back twist"
];

function startStretch() {
  stretchIndex = 0;
  runStretch();
}

function runStretch() {
  if (stretchIndex >= stretches.length) {
    alert("🎉 Done!");
    goHome();
    return;
  }

  let time = 30;
  document.getElementById("exerciseStatus").innerText =
    stretches[stretchIndex] + " - " + time + "s";

  stretchTimer = setInterval(() => {
    if (!paused) {
      time--;
      document.getElementById("exerciseStatus").innerText =
        stretches[stretchIndex] + " - " + time + "s";
    }

    if (time <= 0) {
      clearInterval(stretchTimer);

      let breakTime = 15;
      let breakInterval = setInterval(() => {
        if (!paused) {
          breakTime--;
          document.getElementById("exerciseStatus").innerText =
            "Next in " + breakTime + "s";
        }

        if (breakTime <= 0) {
          clearInterval(breakInterval);
          stretchIndex++;
          runStretch();
        }
      }, 1000);
    }

  }, 1000);
}

// -------- PAUSE --------
function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").innerText =
    paused ? "Resume" : "Pause";
}
