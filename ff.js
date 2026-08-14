const API_URL = "https://focus-fuel-backend.onrender.com/api/logs";

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
        // Update dashboard outputs and styling with calculated backend data
        updateDashboardUI(data);

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

function updateDashboardUI(data) {
    // 1. Core text values (required by existing frontend/tests)
    document.getElementById("burnoutOutput").textContent = data.burnout;
    document.getElementById("productivityOutput").textContent = data.productivity + "%";
    document.getElementById("studyOutput").textContent = data.study + " hrs";
    document.getElementById("recommendationOutput").textContent = data.recommendation;

    // 2. Visual elements
    
    // Update productivity fuel bar
    const productivityBar = document.getElementById("productivityBar");
    if (productivityBar) {
        productivityBar.style.width = data.productivity + "%";
    }

    // Update burnout dot and icon box styles
    const burnoutDot = document.getElementById("burnoutDot");
    const burnoutIconBox = document.getElementById("burnoutIconBox");
    if (burnoutDot && burnoutIconBox) {
        // Reset classes
        burnoutDot.className = "w-3.5 h-3.5 rounded-full transition-all duration-300 animate-pulse";
        burnoutIconBox.className = "p-3 rounded-2xl transition-all duration-300";

        if (data.burnout === "High") {
            burnoutDot.classList.add("indicator-pulse-high");
            burnoutIconBox.classList.add("bg-red-50", "text-red-500");
            burnoutIconBox.innerHTML = `<i id="burnoutIcon" data-lucide="alert-triangle" class="w-7 h-7"></i>`;
        } else if (data.burnout === "Moderate") {
            burnoutDot.classList.add("indicator-pulse-moderate");
            burnoutIconBox.classList.add("bg-amber-50", "text-amber-500");
            burnoutIconBox.innerHTML = `<i id="burnoutIcon" data-lucide="zap" class="w-7 h-7"></i>`;
        } else {
            burnoutDot.classList.add("indicator-pulse-low");
            burnoutIconBox.classList.add("bg-green-50", "text-green-500");
            burnoutIconBox.innerHTML = `<i id="burnoutIcon" data-lucide="shield-check" class="w-7 h-7"></i>`;
        }
        
        // Re-initialize Lucide icons for the updated HTML
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

function clearDashboardUI() {
    document.getElementById("burnoutOutput").textContent = "-";
    document.getElementById("productivityOutput").textContent = "-";
    document.getElementById("studyOutput").textContent = "-";
    document.getElementById("recommendationOutput").textContent = "Please submit your daily log on the dashboard to see recommendations.";
    
    const productivityBar = document.getElementById("productivityBar");
    if (productivityBar) {
        productivityBar.style.width = "0%";
    }
    
    const burnoutDot = document.getElementById("burnoutDot");
    const burnoutIconBox = document.getElementById("burnoutIconBox");
    if (burnoutDot && burnoutIconBox) {
        burnoutDot.className = "w-3.5 h-3.5 rounded-full bg-gray-300";
        burnoutIconBox.className = "p-3 bg-focus-50 text-focus-600 rounded-2xl";
        burnoutIconBox.innerHTML = `<i id="burnoutIcon" data-lucide="shield-check" class="w-7 h-7"></i>`;
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

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

        if (data.length === 0) {
            historyBox.innerHTML = `
                <div class="text-focus-400 py-12 text-center text-sm font-medium border border-dashed border-focus-200 rounded-2xl bg-white/40">
                    <i data-lucide="book-open" class="w-12 h-12 mx-auto mb-3 text-focus-300"></i>
                    No reflection logs recorded yet. Start by logging your day above!
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            clearDashboardUI();
            return;
        }

        // Populate the cockpit dashboard with the latest entry on initial load/refresh
        const latest = data[0];
        updateDashboardUI(latest);

        // Render log entries, maintaining newest first order returned by the API
        data.forEach((log, index) => {
            const entryNum = data.length - index;
            
            const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }) : 'Reflection';

            let burnoutBadgeClass = "";
            if (log.burnout === "High") {
                burnoutBadgeClass = "bg-red-50 text-red-600 border border-red-100";
            } else if (log.burnout === "Moderate") {
                burnoutBadgeClass = "bg-amber-50 text-amber-600 border border-amber-100";
            } else {
                burnoutBadgeClass = "bg-green-50 text-green-600 border border-green-100";
            }

            historyBox.innerHTML += `
                <div class="bg-white p-5 rounded-2xl border border-focus-100/70 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex flex-col gap-1.5">
                        <div class="flex items-center gap-3">
                            <span class="font-extrabold text-focus-800 text-sm tracking-tight">Entry ${entryNum}</span>
                            <span class="text-[10px] text-focus-400 font-semibold uppercase tracking-wider">${dateStr}</span>
                        </div>
                        <div class="text-xs text-focus-600/80 leading-relaxed font-medium">
                            Entry ${entryNum} → Study: ${log.study}h | Sleep: ${log.sleep}h | Breaks: ${log.breaks} | Stress: ${log.stress} | Burnout: ${log.burnout} | Score: ${log.productivity}%
                        </div>
                    </div>

                    <div class="flex items-center gap-3 flex-wrap">
                        <span class="px-3 py-1 rounded-full text-xs font-bold ${burnoutBadgeClass}">
                            Burnout: ${log.burnout}
                        </span>
                        <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-fuel-50 text-fuel-600 border border-fuel-100">
                            <i data-lucide="zap" class="w-3.5 h-3.5"></i>
                            Score: ${log.productivity}%
                        </div>
                    </div>
                </div>
            `;
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    })
    .catch(error => {
        console.error("Error rendering history logs:", error);
        historyBox.innerHTML = `
            <div class="text-red-400 py-8 text-center text-sm font-medium border border-dashed border-red-100 rounded-2xl bg-red-50/30">
                <i data-lucide="alert-circle" class="w-10 h-10 mx-auto mb-2 text-red-300"></i>
                Unable to load study history. Please make sure the server is running.
            </div>
        `;
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
}

// Initial load to retrieve logs on page refresh
window.addEventListener("load", function () {
    renderLogs();
});
