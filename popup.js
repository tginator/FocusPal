const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const blockToggle = document.getElementById("blockToggle");
const quoteDisplay = document.getElementById("quote");
const modeStatus = document.getElementById("modeStatus");
const streakDisplay = document.getElementById("streakDisplay");
const container = document.getElementById("container");

const quotes = [
  "The future depends on what you do today. - Mahatma Gandhi",
  "Success is not the key to happiness. Happiness is the key to success. - Albert Schweitzer",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "You miss 100% of the shots you don't take. - Wayne Gretzky",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
  "Opportunities don't happen, you create them. - Chris Grosser",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
  "Act as if what you do makes a difference. It does. - William James",
  "Success is not in what you have, but who you are. - Bo Bennett",
  "The only place where success comes before work is in the dictionary. - Vidal Sassoon",
  "Don't count the days, make the days count. - Muhammad Ali",
  "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
  "It does not matter how slowly you go as long as you do not stop. - Confucius"
];

function showRandomQuote() {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = `"${random}"`;
}

function updateDisplay() {
  // Update time
  chrome.runtime.sendMessage({ action: "getTime" }, (res) => {
    if (chrome.runtime.lastError) {
      console.log("Error getting time:", chrome.runtime.lastError);
      return;
    }
    const time = res?.timeLeft ?? 1500;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  });

  // Update mode visuals with smooth transition
  chrome.runtime.sendMessage({ action: "getMode" }, (res) => {
    if (chrome.runtime.lastError) {
      console.log("Error getting mode:", chrome.runtime.lastError);
      return;
    }
    const mode = res?.mode || "focus";
    const isBreakMode = mode === "break";
    
    // Add transition class for smooth mode change
    if (document.body.classList.contains("break-mode") !== isBreakMode) {
      document.body.classList.add("transitioning");
      
      setTimeout(() => {
        document.body.classList.toggle("break-mode", isBreakMode);
        modeStatus.textContent = isBreakMode ? "Mode: Break" : "Mode: Focus";
        
        // Add mode change animation
        if (isBreakMode) {
          showBreakModeAnimation();
        } else {
          showFocusModeAnimation();
        }
        
        setTimeout(() => {
          document.body.classList.remove("transitioning");
        }, 500);
      }, 250);
    } else {
      modeStatus.textContent = isBreakMode ? "Mode: Break" : "Mode: Focus";
    }
  });

  // Update streak - always fetch latest value
  chrome.storage.local.get(["streakCount"], (data) => {
    const streak = data.streakCount || 0;
    streakDisplay.textContent = `Streak: ${streak} day${streak === 1 ? "" : "s"}`;
  });
}

// Animation functions for mode transitions
function showBreakModeAnimation() {
  // Add a subtle pulse effect for break mode
  timerDisplay.style.animation = "pulse 0.5s ease-in-out";
  setTimeout(() => {
    timerDisplay.style.animation = "";
  }, 500);
  
  // Show break mode indicator
  showModeIndicator("Break Time!");
}

function showFocusModeAnimation() {
  // Add a subtle scale effect for focus mode
  timerDisplay.style.animation = "scaleIn 0.5s ease-in-out";
  setTimeout(() => {
    timerDisplay.style.animation = "";
  }, 500);
  
  // Show focus mode indicator
  showModeIndicator("Focus Mode");
}

// Show mode change indicator
function showModeIndicator(message) {
  // Create or update mode indicator
  let indicator = document.getElementById("modeIndicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "modeIndicator";
    indicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: bold;
      z-index: 1000;
      animation: fadeInUp 0.5s ease-out;
    `;
    document.body.appendChild(indicator);
  }
  
  indicator.textContent = message;
  indicator.style.display = "block";
  
  // Hide after 2 seconds
  setTimeout(() => {
    indicator.style.display = "none";
  }, 2000);
}

let timerInterval = null;

function startUpdatingDisplay() {
  if (!timerInterval) {
    updateDisplay(); // Immediate update
    timerInterval = setInterval(updateDisplay, 1000);
  }
}

function stopUpdatingDisplay() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Event: Start timer
startBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "startTimer" });
  startUpdatingDisplay();
});

// Event: Stop timer
stopBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stopTimer" });
  stopUpdatingDisplay();
  updateDisplay();
});

// Event: Reset timer
document.getElementById("resetTimerBtn").addEventListener("click", () => {
  console.log("Reset timer button clicked");
  chrome.runtime.sendMessage({ action: "resetTimer" }, (response) => {
    console.log("Reset timer response:", response);
    // Force update display after reset
    setTimeout(() => {
      updateDisplay();
    }, 100);
  });
});

// Event: Toggle block mode
blockToggle.addEventListener("change", () => {
  chrome.storage.local.set({ blockEnabled: blockToggle.checked });
});

// Event: Settings icon click
document.querySelector(".settings-icon").addEventListener("click", () => {
  window.location.href = "settings.html";
});

// Listen for mode change (from background.js)
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "modeChanged") {
    updateDisplay(); // React immediately
  }
  
  if (message.action === "streakUpdated") {
    // Update streak display immediately when streak changes
    const streak = message.streak;
    console.log("Streak updated in popup:", streak);
    streakDisplay.textContent = `Streak: ${streak} day${streak === 1 ? "" : "s"}`;
  }
  
  if (message.action === "timerReset") {
    // Update timer display immediately when timer is reset
    console.log("Timer reset in popup:", message.timeLeft);
    updateDisplay();
  }
});

// Init on load
document.addEventListener("DOMContentLoaded", () => {
  // Force immediate display update
  setTimeout(() => {
    updateDisplay();
  }, 100);
  
  startUpdatingDisplay();
  showRandomQuote();
  debugStreakStatus(); // Debug: check current streak status
  debugTimerState(); // Debug: check current timer state

  chrome.storage.local.get("blockEnabled", (data) => {
    blockToggle.checked = data.blockEnabled || false;
  });
});
