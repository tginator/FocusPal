let timer;
let timeLeft = 1500;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    document.getElementById('timer').textContent =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

document.getElementById('startBtn').addEventListener('click', () => {

    if (timer) return;

    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Time's up! Take a break.");
        }
    }, 1000);
});

document.getElementById('stopBtn').addEventListener('click', () => {
    clearInterval(timer);
    timer = null;
    timeLeft = 1500;
    updateDisplay();
});

updateDisplay(); 