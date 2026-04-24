let steps = 0;
let lastMovementTime = Date.now();
let isMoving = false;

// Start tracking (must be triggered by user click on iPhone)
function startTracking() {

  if (typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function") {

    DeviceMotionEvent.requestPermission()
      .then(permission => {
        if (permission === "granted") {
          window.addEventListener("devicemotion", handleMotion);
          alert("Motion tracking enabled ✅");
        } else {
          alert("Permission denied ❌");
        }
      })
      .catch(console.error);

  } else {
    // Android / Chrome
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

  // SHAKE = STEP
  if (magnitude > 18) {
    steps++;
    lastMovementTime = now;
    isMoving = true;

    document.getElementById("steps").innerText =
      "Steps (shakes): " + steps;

    document.getElementById("status").innerText =
      "🚶 Testing: you are moving";
  }
}

// CHECK STILLNESS EVERY SECOND
setInterval(() => {
  let now = Date.now();
  let inactiveTime = (now - lastMovementTime) / 1000;

  // IF STILL FOR 30 SECONDS
  if (inactiveTime > 30) {
    if (isMoving) {
      alert("Testing: you are still");
      isMoving = false;
    }

    document.getElementById("status").innerText =
      "🪑 Testing: you are still";
  }

}, 1000);
