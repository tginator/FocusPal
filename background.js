const blockedSites = [
    "youtube.com",
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "tiktok.com",
];

let timerInterval;
let timeLeft = 1500; // 25 mins


// block distracting sites functionality
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.storage.local.get("blockEnabled", (data) => {
      if (data.blockEnabled) {
        const url = changeInfo.url.toLowerCase();
        for (let site of blockedSites) {
          if (url.includes(site)) {
            // Redirect to our stay focused custom page
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

// Start focus session from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
      timeLeft--;
        chrome.storage.local.set({ timeLeft });

      if (timeLeft <= 0) {
        
        clearInterval(timerInterval);
        timerInterval = null;
        timeLeft = 1500; // Reset to 25 mins
        chrome.storage.local.set({ timeLeft});

        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon.png",
          title: "Focus Session Complete!",
          message: "Great job! Take a short break.",
          priority: 2
        });
      }
    }, 1000);
}

if (message.action === "stopTimer") {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 1500; // Reset to 25 mins
    chrome.storage.local.set({ timeLeft });
}

if (message.action === "getTime") {
    sendResponse({ timeLeft });
}
});