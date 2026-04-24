let steps = 0;
let lastStepTime = 0;
let startTime = Date.now();
let lastMovementTime = Date.now();

function startTracking() {
  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then(permission => {
      if (permission === "granted") {
        window.addEventListener("devicemotion", handleMotion);
      }
    });
  } else {
    window.addEventListener("devicemotion", handleMotion);
  }
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

  // STEP DETECTION
  if (magnitude > 14 && now - lastStepTime > 400) {
    steps++;
    lastStepTime = now;
    lastMovementTime = now;

    document.getElementById("steps").innerText = "Steps: " + steps;
    document.getElementById("status").innerText = "🚶 Moving";
  }

  // SHAKE DETECTION (unbalanced)
  if (magnitude > 25) {
    document.getElementById("status").innerText =
      "⚠️ Sudden movement detected! Are you unbalanced?";
  }
}

// fallback button
function simulateStep() {
  steps++;
  lastMovementTime = Date.now();
  document.getElementById("steps").innerText = "Steps: " + steps;
}

// TIMER + REMINDERS
setInterval(() => {
  let now = Date.now();

  let seconds = Math.floor((now - startTime) / 1000);
  document.getElementById("timer").innerText = "Time: " + seconds + "s";

  let inactiveTime = (now - lastMovementTime) / 1000;

  // INACTIVITY REMINDER (60 sec = demo version of 60 min)
  if (inactiveTime > 60) {
    document.getElementById("status").innerText =
      "⏰ You've been inactive. Get up!";
  }

  // OVERACTIVITY (continuous movement)
  if (steps > 50 && seconds < 60) {
    document.getElementById("status").innerText =
      "🔥 You've been very active. Chill for a bit.";
  }

}, 1000);
