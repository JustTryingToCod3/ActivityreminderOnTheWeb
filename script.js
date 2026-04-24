let steps = 0;
let lastStepTime = 0;
let lastMovementTime = Date.now();
let startTime = Date.now();
let isMoving = false;
let sedentaryPromptShown = false;

function startTracking() {
  document.getElementById("startBtn").innerText = "Tracking...";

  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {

    DeviceMotionEvent.requestPermission().then(permission => {
      if (permission === "granted") {
        window.addEventListener("devicemotion", handleMotion);
        alert("Motion tracking enabled ✅");
      } else {
        alert("Permission denied ❌");
      }
    });

  } else {
    window.addEventListener("devicemotion", handleMotion);
    alert("Motion tracking started ✅");
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

  // STEP DETECTION (walking pattern)
  if (magnitude > 12 && magnitude < 20 && now - lastStepTime > 400) {
    steps++;
    lastStepTime = now;
    lastMovementTime = now;
    sedentaryPromptShown = false;

    document.getElementById("steps").innerText = "Steps: " + steps;
    setMovingState();
  }

  // WOBBLY DETECTION
  if (magnitude > 25) {
    alert("⚠️ You seem wobbly. Would you like to sit down?");
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

  // STILL DETECTION
  if (inactiveTime > 5 && isMoving) {
    isMoving = false;
    document.getElementById("status").innerText = "🪑 You are still";
    document.getElementById("body").className = "still";
  }

  // SEDENTARY REMINDER (60 seconds)
  if (inactiveTime > 60 && !sedentaryPromptShown) {
    sedentaryPromptShown = true;

    let choice = confirm("Would you like to move?");
    if (choice) {
      document.getElementById("status").innerText = "💪 Great! Let's move!";
    } else {
      document.getElementById("status").innerText = "😌 Okay, resting is fine too.";
    }
  }

}, 1000);
