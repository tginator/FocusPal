let timerInterval = null;
let timeLeft = 1500; // fallback
let mode = "focus";

// SITE BLOCKING
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.storage.local.get(["blockEnabled", "customBlockedSites"], (data) => {
      if (data.blockEnabled) {
        const sites = data.customBlockedSites || [
          "youtube.com",
          "facebook.com",
          "twitter.com",
          "instagram.com",
          "tiktok.com"
        ];

        const url = changeInfo.url.toLowerCase();
        for (let site of sites) {
          if (url.includes(site)) {
            chrome.tabs.update(tabId, {
              url: chrome.runtime.getURL("stayfocused.html")
            });
            break;
          }
        }
      }
    });
  }
});

// TIMER CONTROL
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === "getMode") {
    sendResponse({ mode });
    }

 if (message.action === "startTimer") {
  if (timerInterval) return;

  chrome.storage.local.get(["customMinutes"], (data) => {
    const focusMinutes = data.customMinutes || 25;
    const breakMinutes = 5; // you can make this configurable later

    timeLeft = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
    chrome.storage.local.set({ timeLeft });

    timerInterval = setInterval(() => {
      timeLeft--;
      chrome.storage.local.set({ timeLeft });

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;

        if (mode === "focus") {
          // Record session
          const today = new Date().toISOString().split("T")[0];
          chrome.storage.local.get(["sessionHistory"], (result) => {
            const history = result.sessionHistory || {};
            history[today] = (history[today] || 0) + 1;
            chrome.storage.local.set({ sessionHistory: history });
          });

          // Notify and start break
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: "Focus session complete!",
            message: "Nice work! Break starts now.",
            priority: 2
          });

          mode = "break";
          chrome.runtime.sendMessage({ action: "modeChanged", mode: "break" });

          // Auto-start break timer
          chrome.runtime.sendMessage({ action: "startTimer" });

        } else {
          // Break is over
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: "Break over!",
            message: "Time to focus again!",
            priority: 2
          });

          mode = "focus";
          chrome.runtime.sendMessage({ action: "modeChanged", mode: "focus" });

          // Timer ends here — wait for user to click start again
        }
      }
    }, 1000);
  });
}





  if (message.action === "stopTimer") {
    clearInterval(timerInterval);
    timerInterval = null;
    mode = "focus";

    chrome.storage.local.get(["customMinutes"], (data) => {
      const minutes = data.customMinutes || 25;
      timeLeft = minutes * 60;
      chrome.storage.local.set({ timeLeft });
    });
  }

  if (message.action === "getTime") {
    sendResponse({ timeLeft });
  }
});
