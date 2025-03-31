// App state
let lastFeedingTime = localStorage.getItem("lastFeedingTime")
  ? new Date(parseInt(localStorage.getItem("lastFeedingTime")))
  : null;
let feedingHistory = JSON.parse(localStorage.getItem("feedingHistory") || "[]");

// DOM elements
const timerElement = document.getElementById("timer");
const nextFeedingElement = document.getElementById("next-feeding");
const feedBtn = document.getElementById("feed-btn");
const historyList = document.getElementById("history-list");

// Initialize
updateTimer();
renderHistory();

// Update timer every second
const timerInterval = setInterval(updateTimer, 1000);

// Button handler
feedBtn.addEventListener("click", recordFeeding);

// Functions
function recordFeeding() {
  const now = new Date();
  lastFeedingTime = now;

  // Add to history
  feedingHistory.unshift({
    time: now.getTime(),
    displayTime: formatTime(now),
  });

  // Limit history to 50 entries
  if (feedingHistory.length > 50) {
    feedingHistory.pop();
  }

  // Save to local storage
  localStorage.setItem("lastFeedingTime", now.getTime());
  localStorage.setItem("feedingHistory", JSON.stringify(feedingHistory));

  // Update UI
  updateTimer();
  renderHistory();
}

function updateTimer() {
  const now = new Date();

  if (lastFeedingTime) {
    // Calculate elapsed time
    const elapsed = now - lastFeedingTime;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

    // Format time
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    timerElement.textContent = formattedTime;

    // Calculate next feeding (in 3 hours)
    const nextFeeding = new Date(
      lastFeedingTime.getTime() + 3 * 60 * 60 * 1000
    );
    nextFeedingElement.textContent = formatTime(nextFeeding);

    // Highlight if more than 3 hours passed
    if (elapsed >= 3 * 60 * 60 * 1000) {
      timerElement.classList.add("urgent");
    } else {
      timerElement.classList.remove("urgent");
    }
  } else {
    timerElement.textContent = "--:--:--";
    nextFeedingElement.textContent = "--:--";
  }
}

function renderHistory() {
  historyList.innerHTML = "";

  if (feedingHistory.length === 0) {
    historyList.innerHTML = '<div class="history-item">No records yet</div>';
    return;
  }

  feedingHistory.forEach((item, index) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const timeElement = document.createElement("span");
    timeElement.className = "history-time";
    timeElement.textContent = item.displayTime;

    const statusElement = document.createElement("span");
    statusElement.className = "history-status";

    if (index === 0) {
      statusElement.textContent = "Last";
      statusElement.style.color = "#4CAF50";
      statusElement.style.fontWeight = "bold";
    } else {
      const prevTime = index > 0 ? feedingHistory[index - 1].time : null;
      if (prevTime) {
        const diffHours = Math.round((item.time - prevTime) / (1000 * 60 * 60));
        statusElement.textContent = `+${diffHours}h`;
      }
    }

    historyItem.appendChild(timeElement);
    historyItem.appendChild(statusElement);
    historyList.appendChild(historyItem);
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
