
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const blockToggle = document.getElementById('blockToggle');
const quoteDisplay = document.getElementById('quote');

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
    "It does not matter how slowly you go as long as you do not stop. - Confucius"];

function showRandomQuote() {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    quoteDisplay.textContent = `"${random}"`;
}


// function for timer display on popup 
function updateDisplay() {
    chrome.runtime.sendMessage({ action: "getTime" }, (response) => {
        const time = response?.timeLeft ?? 1500;
        const minutes = Math.floor(time /60);
        const seconds = time % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    });
}

let timerInterval = null;

function startUpdatingDisplay() {
    if (timerInterval) return;
    timerInterval = setInterval(updateDisplay, 1000);
}

function stopUpdatingDisplay() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Start and stop buttons
startBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "startTimer"});
    startUpdatingDisplay();
});

stopBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "stopTimer"});
    stopUpdatingDisplay();
    updateDisplay();
    // Reset 
})



// Toggle block mode and save to Chrome storage
blockToggle.addEventListener("change", () => {
  chrome.storage.local.set({ blockEnabled: blockToggle.checked });
});

// On popup load
document.addEventListener("DOMContentLoaded", () => {
  updateDisplay();
  startUpdatingDisplay();
  showRandomQuote();

  // Load saved block state
  chrome.storage.local.get("blockEnabled", (data) => {
    blockToggle.checked = data.blockEnabled || false;
  });
});