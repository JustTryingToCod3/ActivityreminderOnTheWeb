let steps = 0;
let lastStepTime = 0;
let lastMovementTime = Date.now();
let startTime = Date.now();
let isMoving = false;
let sedentaryPromptShown = false;
let wobbleCooldown = false;

function startTracking() {
  document.getElementById("startBtn").innerText = "Tracking...";

  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {

    DeviceMotionEvent.requestPermission().then(permission => {
      if (permission === "granted") {
        startSensors();
        alert("Motion tracking enabled ✅");
      } else {
        alert("Permission denied ❌");
      }
    });

  } else {
    startSensors();
    alert("Motion tracking started ✅");
  }
}

function startSensors() {
  window.addEventListener("devicemotion", handleMotion);
  window.addEventListener("deviceorientation", handleOrientation);
}

function handleMotion(event) {
  let acc = event.accelerationIncludingGravity;
  if (!acc) return;

  let magnitude = Math.sqrt(
    acc.x * acc.x +
    acc.y * acc.y +
    acc.z * acc.z
  );

  let now = Date.now();

  // STEP DETECTION (walking pattern)
  if (magnitude > 11 && magnitude < 20 && now - lastStepTime > 400) {
    steps++;
    lastStepTime = now;
    lastMovementTime = now;
    sedentaryPromptShown = false;

    document.getElementById("steps").innerText = "Steps: " + steps;
    setMovingState();
  }
}

// GYROSCOPE / ORIENTATION (wobble detection)
function handleOrientation(event) {
  let beta = event.beta;   // forward/back tilt
  let gamma = event.gamma; // side tilt

  if (!beta || !gamma) return;

  // detect unstable tilt
  if ((Math.abs(beta) > 45 || Math.abs(gamma) > 45) && !wobbleCooldown) {
    wobbleCooldown = true;

    let choice = confirm("⚠️ You seem wobbly. Would you like to sit down?");
    if (choice) {
      document.getElementById("status").innerText =
        "🪑 Take a moment to rest.";
    } else {
      document.getElementById("status").innerText =
        "👍 Stay safe and steady!";
    }

    // prevent spam
    setTimeout(() => {
      wobbleCooldown = false;
    }, 5000);
  }
}

function setMovingState() {
  isMoving = true;
  document.getElementById("status").innerText = "🚶 You are moving";
  document.getElementById("body").className = "moving";
}

// TIMER + STATE CHECK
setInterval(() => {
  let now = Date.now();
  let seconds = Math.floor((now - startTime) / 1000);

  document.getElementById("timer").innerText = "Time: " + seconds + "s";

  let inactiveTime = (now - lastMovementTime) / 1000;

  // STILL DETECTION (~5 sec)
  if (inactiveTime > 5 && isMoving) {
    isMoving = false;
    document.getElementById("status").innerText = "🪑 You are still";
    document.getElementById("body").className = "still";
  }

  // 30 SECOND STILL ALERT
  if (inactiveTime > 30 && inactiveTime < 31) {
    alert("Testing: you are still");
  }

  // 60 SECOND NUDGE
  if (inactiveTime > 60 && !sedentaryPromptShown) {
    sedentaryPromptShown = true;

    let choice = confirm("Would you like to move?");
    if (choice) {
      document.getElementById("status").innerText =
        "💪 Great! Let's move!";
    } else {
      document.getElementById("status").innerText =
        "😌 Resting is okay too.";
    }
  }

}, 1000);
