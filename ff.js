const API_URL = "http://localhost:5000/api/logs";

document.getElementById("analyzeBtn").addEventListener("click", function () {
    const studyHoursInput = document.getElementById("studyHours").value.trim();
    const sleepHoursInput = document.getElementById("sleepHours").value.trim();
    const breaksTakenInput = document.getElementById("breaksTaken").value.trim();
    const stressLevelInput = document.getElementById("stressLevel").value.trim();

    // Validate inputs - must be filled, numeric, and non-negative (0 is allowed)
    if (studyHoursInput === "" || sleepHoursInput === "" || breaksTakenInput === "" || stressLevelInput === "") {
        alert("Please fill in all fields properly.");
        return;
    }

    const study = Number(studyHoursInput);
    const sleep = Number(sleepHoursInput);
    const breaks = Number(breaksTakenInput);
    const stress = Number(stressLevelInput);

    if (isNaN(study) || isNaN(sleep) || isNaN(breaks) || isNaN(stress) ||
        study < 0 || sleep < 0 || breaks < 0 || stress < 0) {
        alert("Please fill in all fields properly.");
        return;
    }

    // POST request to backend API
    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ study, sleep, breaks, stress })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Unable to save your study log.");
        }
        return response.json();
    })
    .then(data => {
        // Update dashboard outputs with calculated backend data
        document.getElementById("burnoutOutput").textContent = data.burnout;
        document.getElementById("productivityOutput").textContent = data.productivity + "%";
        document.getElementById("studyOutput").textContent = data.study + " hrs";
        document.getElementById("recommendationOutput").textContent = data.recommendation;

        // Reset input fields
        document.getElementById("studyHours").value = "";
        document.getElementById("sleepHours").value = "";
        document.getElementById("breaksTaken").value = "";
        document.getElementById("stressLevel").value = "";

        // Re-render history logs from backend
        renderLogs();
    })
    .catch(error => {
        console.error("Error submitting study log:", error);
        alert("Unable to save your study log. Please make sure the server is running.");
    });
});

function renderLogs() {
    const historyBox = document.getElementById("historyOutput");

    // GET request to retrieve all logs from backend
    fetch(API_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error("Unable to retrieve history.");
        }
        return response.json();
    })
    .then(data => {
        historyBox.innerHTML = "";

        // Render log entries, maintaining newest first order returned by the API
        data.forEach((log, index) => {
            const entryNum = data.length - index;
            historyBox.innerHTML += `
                <div class="border-b py-2 text-sm text-gray-600">
                    Entry ${entryNum} → 
                    Study: ${log.study}h | Sleep: ${log.sleep}h | Breaks: ${log.breaks} | Stress: ${log.stress} | Burnout: ${log.burnout} | Score: ${log.productivity}%
                </div>
            `;
        });
    })
    .catch(error => {
        console.error("Error rendering history logs:", error);
        historyBox.innerHTML = `
            <div class="text-rose-400 py-2 text-sm">
                Unable to load study history. Please make sure the server is running.
            </div>
        `;
    });
}

// Initial load to retrieve logs on page refresh
window.addEventListener("load", function () {
    renderLogs();
});
