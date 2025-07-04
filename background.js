const blockedSites = [
    "youtube.com",
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "tiktok.com",
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.storage.local.get("blockEnabled", (data) => {
      if (data.blockEnabled) {
        const url = changeInfo.url.toLowerCase();
        for (let site of blockedSites) {
          if (url.includes(site)) {
            chrome.tabs.remove(tabId);
            break;
          }
        }
      }
    });
  }
});