document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["customMinutes", "customBlockedSites"], (data) => {
    document.getElementById("focusMinutes").value = data.customMinutes || 25;
    document.getElementById("blockedSites").value = (data.customBlockedSites || []).join("\n");
  });

 document.getElementById("saveTimer").addEventListener("click", () => {
  const minutes = parseInt(document.getElementById("focusMinutes").value);

  if (isNaN(minutes) || minutes <= 0) {
    alert("Please enter a valid number greater than 0.");
    return;
  }

  chrome.storage.local.set({ customMinutes: minutes }, () => {
    // Update the timer in background with new settings
    chrome.runtime.sendMessage({ action: "updateTimerSettings" }, () => {
      alert("Focus time updated to " + minutes + " minutes.");
    });
  });
});


  document.getElementById("saveSites").addEventListener("click", () => {
    const sites = document.getElementById("blockedSites").value
      .split("\n")
      .map(site => site.trim())
      .filter(site => site !== "");
    chrome.storage.local.set({ customBlockedSites: sites });
    alert("Blocked sites saved.");
  });
});

document.querySelector(".home-icon").addEventListener("click", () => {
    window.location.href = "popup.html";
});
