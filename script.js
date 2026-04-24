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

  if (mag > 11 && mag < 20 && now - lastMove > 400) {
    steps++;
    lastMove = now;
    lastMovementTime = now;

    document.getElementById("steps").innerText = "Steps: " + steps;
    setMoving(true);
  }

  if (exercise && mag > 14 && now - lastMove > 400) {
    count++;
    lastMove = now;

    document.getElementById("counter").innerText = count + " / 10";
    document.getElementById("progress").style.width = (count*10) + "%";

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
    showToast("You are still");
  }

  if (inactive > 60) {
    if (confirm("Move a little?")) setMoving(true);
  }

}, 1000);

// -------- EXERCISES --------
function startExercise(type) {
  exercise = type;
  count = 0;
  showScreen("exerciseScreen");

  document.getElementById("exerciseTitle").innerText = type;
  document.getElementById("progress").style.width = "0%";

  if (type === "stretch") startStretch();
}

function finishExercise() {
  launchConfetti();
  showToast("🎉 Great job!");

  if (!confirm("Continue?")) goHome();
  else count = 0;
}

// -------- STRETCH --------
let stretches = ["Touch toes","Lunge left","Lunge right","Butterfly","Arm","Back twist"];

function startStretch() {
  stretchIndex = 0;
  runStretch();
}

function runStretch() {
  if (stretchIndex >= stretches.length) {
    showToast("All done!");
    goHome();
    return;
  }

  let time = 30;

  stretchTimer = setInterval(() => {
    if (!paused) {
      time--;
      document.getElementById("exerciseStatus").innerText =
        stretches[stretchIndex] + " - " + time + "s";

      document.getElementById("progress").style.width =
        ((30-time)/30*100) + "%";
    }

    if (time <= 0) {
      clearInterval(stretchTimer);
      stretchIndex++;
      setTimeout(runStretch, 15000);
    }

  }, 1000);
}

// -------- PAUSE --------
function togglePause() {
  paused = !paused;
  document.getElementById("pauseBtn").innerText =
    paused ? "Resume" : "Pause";
}

// -------- UI FX --------
function showToast(msg) {
  let t = document.createElement("div");
  t.innerText = msg;
  t.style.position = "fixed";
  t.style.top = "20px";
  t.style.left = "50%";
  t.style.transform = "translateX(-50%)";
  t.style.background = "black";
  t.style.color = "white";
  t.style.padding = "10px 20px";
  t.style.borderRadius = "10px";

  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function launchConfetti() {
  for (let i=0;i<20;i++){
    let c = document.createElement("div");
    c.innerText="🎉";
    c.style.position="fixed";
    c.style.left=Math.random()*100+"%";
    c.style.top="0px";
    c.style.fontSize="20px";

    document.body.appendChild(c);

    let fall = setInterval(()=>{
      c.style.top = (parseInt(c.style.top)+5)+"px";
      if (parseInt(c.style.top) > window.innerHeight) {
        clearInterval(fall);
        c.remove();
      }
    },20);
  }
}
