let tracking = false;
let steps = 0;
let exercise = null;
let count = 0;

// -------- NAVIGATION --------
function goHome() {
  showScreen("homeScreen");
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
  tracking = true;
  window.addEventListener("devicemotion", handleMotion);
  document.getElementById("status").innerText = "Tracking...";
}

function stopTracking() {
  tracking = false;
  window.removeEventListener("devicemotion", handleMotion);
  document.getElementById("status").innerText = "Stopped";
}

function handleMotion(event) {
  if (!tracking) return;

  let acc = event.accelerationIncludingGravity;
  if (!acc) return;

  let mag = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);

  if (mag > 12) {
    steps++;
    document.getElementById("steps").innerText = "Steps: " + steps;
  }

  // exercise counting
  if (exercise && mag > 14) {
    count++;
    document.getElementById("counter").innerText = count + " / 10";

    if (count >= 10) finishExercise();
  }
}

// -------- EXERCISES --------
function startExercise(type) {
  exercise = type;
  count = 0;

  showScreen("exerciseScreen");

  document.getElementById("exerciseTitle").innerText = type.toUpperCase();
  document.getElementById("counter").innerText = "0 / 10";

  if (type === "stretch") startStretchRoutine();
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
    "Lunge (left leg)",
    "Lunge (right leg)",
    "Butterfly stretch",
    "Arm stretch",
    "Back twist"
  ];

  let i = 0;

  function next() {
    if (i >= stretches.length) {
      alert("🎉 ALL DONE!");
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
  document.body.appendChild(el);

  setTimeout(() => el.remove(), 2000);
}
