let tracking = false;
let steps = 0;
let exercise = null;
let count = 0;
let startTime = Date.now();
let motionListener = null;

// -------- NAVIGATION --------
function goHome() {
  showScreen("homeScreen");
  resetExercise();
}

function showActivities() {
  showScreen("activityScreen");
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// -------- TRACKING --------
function startTracking() {
  if (tracking) return; // prevent duplicates

  tracking = true;
  startTime = Date.now();

  motionListener = function(event) {
    handleMotion(event);
  };

  window.addEventListener("devicemotion", motionListener);

  document.getElementById("status").innerText = "Tracking...";
}

function stopTracking() {
  tracking = false;

  if (motionListener) {
    window.removeEventListener("devicemotion", motionListener);
  }

  document.getElementById("status").innerText = "Stopped";
}

// -------- MOTION --------
let lastMoveTime = 0;

function handleMotion(event) {
  if (!tracking) return;

  let acc = event.accelerationIncludingGravity;
  if (!acc) return;

  let mag = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
  let now = Date.now();

  // STEP DETECTION
  if (mag > 12 && now - lastMoveTime > 400) {
    steps++;
    lastMoveTime = now;

    document.getElementById("steps").innerText = "Steps: " + steps;
    document.getElementById("status").innerText = "🚶 You are moving";
  }

  // EXERCISE DETECTION
  if (exercise && mag > 14 && now - lastMoveTime > 400) {
    count++;
    lastMoveTime = now;

    document.getElementById("counter").innerText = count + " / 10";

    if (count >= 10) finishExercise();
  }
}

// -------- TIMER --------
setInterval(() => {
  let seconds = Math.floor((Date.now() - startTime) / 1000);

  let timer = document.getElementById("timer");
  if (timer) {
    timer.innerText = "Time: " + seconds + "s";
  }
}, 1000);

// -------- EXERCISES --------
function startExercise(type) {
  exercise = type;
  count = 0;

  showScreen("exerciseScreen");

  document.getElementById("exerciseTitle").innerText = type.toUpperCase();
  document.getElementById("counter").innerText = "0 / 10";

  if (type === "stretch") {
    startStretchRoutine();
  }
}

function resetExercise() {
  exercise = null;
  count = 0;
}

// -------- FINISH --------
function finishExercise() {
  confetti();

  let again = confirm("🎉 Great job! Continue?");
  if (again) {
    count = 0;
  } else {
    goHome();
  }
}

// -------- STRETCH --------
function startStretchRoutine() {
  let stretches = [
    "Touch your toes",
    "Lunge left",
    "Lunge right",
    "Butterfly stretch",
    "Arm stretch",
    "Back twist"
  ];

  let i = 0;

  function next() {
    if (i >= stretches.length) {
      alert("🎉 All stretches complete!");
      goHome();
      return;
    }

    document.getElementById("exerciseStatus").innerText =
      stretches[i] + " - 30 seconds";

    setTimeout(() => {
      alert("✅ Good job!");
      i++;
      setTimeout(next, 2000);
    }, 30000);
  }

  next();
}

// -------- CONFETTI --------
function confetti() {
  let el = document.createElement("div");
  el.innerText = "🎉🎉🎉";
  el.style.fontSize = "50px";
  el.style.position = "fixed";
  el.style.top = "50%";
  el.style.left = "50%";
  el.style.transform = "translate(-50%, -50%)";

  document.body.appendChild(el);

  setTimeout(() => el.remove(), 2000);
}
