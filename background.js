let timeLeft = 1500; // Default 25 min
let mode = "focus"; // or "break"
let interval = null;
let sessionStarted = false; // Track if a session was started
let sessionCompleted = false; // Track if a session was completed

// Initialize timer with custom settings
function initializeTimer() {
  chrome.storage.local.get(["customMinutes"], (data) => {
    timeLeft = (data.customMinutes || 25) * 60;
    console.log("Timer initialized with", data.customMinutes || 25, "minutes");
  });
}

// Initialize on extension load
initializeTimer();

// Start or restart the timer
function startTimer() {
  if (interval) return;

  sessionStarted = true;
  sessionCompleted = false;

  interval = setInterval(() => {
    timeLeft--;

    // Broadcast time update (optional: if you want live updates externally)
    chrome.runtime.sendMessage({ action: "tick", timeLeft });

    if (timeLeft <= 0) {
      clearInterval(interval);
      interval = null;

      if (mode === "focus") {
        handleFocusComplete();
      } else {
        switchToMode("focus"); // Back to focus after break
      }
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(interval);
  interval = null;
  
  // Reset session tracking when manually stopped
  sessionStarted = false;
  sessionCompleted = false;
}

// Reset timer to beginning of current mode
function resetTimer() {
  if (mode === "focus") {
    chrome.storage.local.get(["customMinutes"], (data) => {
      timeLeft = (data.customMinutes || 25) * 60;
      console.log("Timer reset to focus mode:", timeLeft, "seconds");
      chrome.runtime.sendMessage({ action: "timerReset", timeLeft });
    });
  } else {
    chrome.storage.local.get(["customBreakMinutes"], (data) => {
      timeLeft = (data.customBreakMinutes || 5) * 60;
      console.log("Timer reset to break mode:", timeLeft, "seconds");
      chrome.runtime.sendMessage({ action: "timerReset", timeLeft });
    });
  }
}

// Update timer settings and reset if needed
function updateTimerSettings() {
  if (mode === "focus") {
    chrome.storage.local.get(["customMinutes"], (data) => {
      timeLeft = (data.customMinutes || 25) * 60;
      console.log("Timer settings updated:", timeLeft, "seconds");
      chrome.runtime.sendMessage({ action: "timerReset", timeLeft });
    });
  }
}

// Switch to a mode and start its timer
function switchToMode(newMode) {
  const oldMode = mode;
  mode = newMode;

  if (mode === "focus") {
    chrome.storage.local.get(["customMinutes"], (data) => {
      timeLeft = (data.customMinutes || 25) * 60;
      chrome.runtime.sendMessage({ action: "modeChanged", mode });
      
      // Show notification for mode change
      if (oldMode === "break") {
        showNotification("Focus Mode", "Time to get back to work!");
      }
    });
  } else {
    chrome.storage.local.get(["customBreakMinutes"], (data) => {
      timeLeft = (data.customBreakMinutes || 5) * 60;
      chrome.runtime.sendMessage({ action: "modeChanged", mode });
      
      // Show notification for mode change
      if (oldMode === "focus") {
        showNotification("Break Time!", "Great work! Take a well-deserved break. ☕");
      }
    });
  }

  startTimer();
}

// Show notification function
function showNotification(title, message) {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/iconPal.png',
      title: title,
      message: message
    });
  }
}

// Handle end of focus session: streak + break transition
function handleFocusComplete() {
  const today = new Date().toISOString().split("T")[0];
  console.log("Focus session completed on:", today);

  chrome.storage.local.get(["lastCompleted", "streakCount"], (data) => {
    const last = data.lastCompleted || "";
    let streak = data.streakCount || 0;
    
    console.log("Last completed:", last, "Current streak:", streak);

    if (last !== today) {
      streak += 1;
      console.log("Updating streak to:", streak);
      chrome.storage.local.set({
        streakCount: streak,
        lastCompleted: today
      }, () => {
        // Notify popup that streak was updated
        chrome.runtime.sendMessage({ action: "streakUpdated", streak });
        console.log("Streak updated and notification sent");
      });
    } else {
      console.log("Session already completed today, streak not incremented");
    }
  });

  // Switch to break mode
  switchToMode("break");
}

// Listen for messages from popup or other scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    startTimer();
    sendResponse({ success: true });
  }

  if (message.action === "stopTimer") {
    stopTimer();
    sendResponse({ success: true });
  }

  if (message.action === "resetTimer") {
    resetTimer();
    sendResponse({ success: true });
  }

  if (message.action === "updateTimerSettings") {
    updateTimerSettings();
    sendResponse({ success: true });
  }

  if (message.action === "getTime") {
    sendResponse({ timeLeft });
  }

  if (message.action === "getMode") {
    sendResponse({ mode });
  }
  
  if (message.action === "resetStreak") {
    chrome.storage.local.remove(["streakCount", "lastCompleted"], () => {
      chrome.runtime.sendMessage({ action: "streakUpdated", streak: 0 });
      console.log("Streak reset to 0");
    });
    sendResponse({ success: true });
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});
