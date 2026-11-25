// ============================================
// RevoU Coding Camp - Day 3: JavaScript
// Project: Race Start Traffic Light
// ============================================

// ── Get Variable ────────────────────────────
const lights = [
  document.getElementById("light1"),
  document.getElementById("light2"),
  document.getElementById("light3"),
  document.getElementById("light4"),
  document.getElementById("light5"),
];

const startBtn       = document.getElementById("startBtn");
const resetBtn       = document.getElementById("resetBtn");
const statusLabel    = document.getElementById("statusLabel");
const timerDisplay   = document.getElementById("timerDisplay");
const reactionBox    = document.getElementById("reactionBox");
const intervalSlider = document.getElementById("intervalSlider");
const intervalValue  = document.getElementById("intervalValue");
const goSlider       = document.getElementById("goSlider");
const goValue        = document.getElementById("goValue");

// ── State Variable ───────────────────────────
let isRunning     = false;
let goTime        = null;
let timerInterval = null;
let elapsedMs     = 0;
let timeoutIds    = [];

// ── Helper: format ms ke detik ───────────────
function formatTime(ms) {
  return (ms / 1000).toFixed(3) + "s";
}

// ── Reset semua lampu (hapus semua warna) ────
function resetLights() {
  lights.forEach(function(light) {
    light.classList.remove("red-on", "yellow-on", "green-on");
  });
}

// ── Nyalakan semua lampu dengan 1 warna ──────
function setAllLights(colorClass) {
  lights.forEach(function(light) {
    light.classList.remove("red-on", "yellow-on", "green-on");
    light.classList.add(colorClass);
  });
}

// ── Update teks status ───────────────────────
function setStatus(text, className) {
  statusLabel.textContent = text;
  statusLabel.className   = "status-label " + className;
}

// ── Mulai stopwatch ──────────────────────────
function startTimer() {
  const startTime = Date.now();
  timerDisplay.className = "timer-display running";

  timerInterval = setInterval(function() {
    elapsedMs = Date.now() - startTime;
    timerDisplay.textContent = formatTime(elapsedMs);
  }, 10);
}

// ── Hentikan stopwatch ───────────────────────
function stopTimer() {
  clearInterval(timerInterval);
  timerDisplay.className = "timer-display stopped";
}

// ── Batalkan semua timeout yang antri ────────
function clearAllTimeouts() {
  timeoutIds.forEach(function(id) {
    clearTimeout(id);
  });
  timeoutIds = [];
}

// ── SEKUENS UTAMA ────────────────────────────
//
// Alur:
// 1. Merah 1 menyala
// 2. Merah 2 menyala
// 3. Merah 3 menyala
// 4. Merah 4 menyala
// 5. Merah 5 menyala   ← semua merah
// 6. [jeda goDelay]
// 7. Semua mati → semua KUNING
// 8. [jeda 1 detik]
// 9. Semua mati → semua HIJAU = GO! + timer mulai

function startRaceSequence() {
  const interval = parseInt(intervalSlider.value); // jeda antar lampu merah
  const goDelay  = parseInt(goSlider.value);        // jeda setelah semua merah

  isRunning = true;
  startBtn.disabled = true;
  reactionBox.textContent  = "";
  timerDisplay.className   = "timer-display";
  timerDisplay.textContent = "0.000s";

  setStatus("PREPARING...", "waiting");

  // ── FASE 1: Nyalakan merah satu per satu ──
  for (let i = 0; i < lights.length; i++) {
    const delay = (i + 1) * interval;

    const id = setTimeout(function() {
      lights[i].classList.add("red-on");
      setStatus("LIGHTS ON... (" + (i + 1) + "/5)", "starting");
    }, delay);

    timeoutIds.push(id);
  }

  // Waktu setelah semua 5 lampu merah menyala
  const allRedTime = lights.length * interval;

  // ── FASE 2: Jeda → semua lampu mati → KUNING ──
  const yellowId = setTimeout(function() {
    resetLights();
    setAllLights("yellow-on");
    setStatus("CAUTION...", "yellow");
  }, allRedTime + goDelay);

  timeoutIds.push(yellowId);

  // ── FASE 3: 1 detik kemudian → HIJAU = GO! + mulai timer ──
  const greenId = setTimeout(function() {
    resetLights();
    setAllLights("green-on");
    setStatus("GO!  GO!  GO!", "go");

    goTime    = Date.now();
    isRunning = false;
    startTimer();

    // Klik di mana saja untuk stop timer (reaction time)
    document.addEventListener("click", handleReactionClick);
  }, allRedTime + goDelay + 1000); // kuning selama 1 detik

  timeoutIds.push(greenId);
}

// ── Tangkap klik setelah GO ──────────────────
function handleReactionClick(event) {
  if (event.target === resetBtn) return;

  stopTimer();
  document.removeEventListener("click", handleReactionClick);

  const reaction = Date.now() - goTime;
  reactionBox.innerHTML = "Reaction time: <span>" + formatTime(reaction) + "</span>";

  startBtn.disabled = false;
  setStatus("FINISHED!", "waiting");
}

// ── RESET ────────────────────────────────────
function resetAll() {
  clearAllTimeouts();
  clearInterval(timerInterval);
  document.removeEventListener("click", handleReactionClick);

  resetLights();
  setStatus("READY", "waiting");
  timerDisplay.textContent = "0.000s";
  timerDisplay.className   = "timer-display";
  reactionBox.textContent  = "";

  isRunning = false;
  goTime    = null;
  elapsedMs = 0;
  startBtn.disabled = false;
}

// ── Slider: tampilkan nilai real-time ────────
intervalSlider.addEventListener("input", function() {
  intervalValue.textContent = (this.value / 1000).toFixed(1) + "s";
});

goSlider.addEventListener("input", function() {
  goValue.textContent = (this.value / 1000).toFixed(1) + "s";
});

// ── Event Listener Tombol ────────────────────
startBtn.addEventListener("click", function() {
  if (!isRunning) {
    startRaceSequence();
  }
});

resetBtn.addEventListener("click", function() {
  resetAll();
});
