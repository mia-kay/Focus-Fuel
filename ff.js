let logs = JSON.parse(localStorage.getItem("focusfuelLogs")) || [];



document.getElementById("analyzeBtn").addEventListener("click", function () {

    // INPUT VALUES
    let study = Number(document.getElementById("studyHours").value);
    let sleep = Number(document.getElementById("sleepHours").value);
    let breaks = Number(document.getElementById("breaksTaken").value);
    let stress = Number(document.getElementById("stressLevel").value);

    // VALIDATION
    if (!study || !sleep || !breaks || !stress) {
        alert("Please fill in all fields properly.");
        return;
    }

    // BURNOUT LOGIC
    let burnout = "";

    if (sleep < 5 && stress > 7 && study > 6) {
        burnout = "High";
    } 
    else if (sleep < 6 || stress > 6 || study > 8) {
        burnout = "Moderate";
    } 
    else {
        burnout = "Low";
    }

    // PRODUCTIVITY SCORE
    let productivity = Math.round(
        (sleep * 12) + (study * 8) + (breaks * 4) - (stress * 10)
    );

    if (productivity < 0) productivity = 0;
    if (productivity > 100) productivity = 100;

    // RECOMMENDATIONS
    let recommendation = "";

    if (burnout === "High") {
        recommendation = "High burnout detected. Reduce study load and prioritize sleep immediately.";
    } 
    else if (burnout === "Moderate") {
        recommendation = "You're slightly imbalanced. Improve sleep and take more structured breaks.";
    } 
    else {
        recommendation = "Great balance! Keep maintaining your current routine.";
    }

    //  SAVE LOG
   logs.push({
    study: study,
    sleep: sleep,
    breaks: breaks,
    stress: stress,
    burnout: burnout,
    productivity: productivity
});

// keeps only last 4 logs
if (logs.length > 4) {
    logs = logs.slice(-4);
}


    localStorage.setItem("focusfuelLogs", JSON.stringify(logs));

  
    document.getElementById("burnoutOutput").textContent = burnout;
    document.getElementById("productivityOutput").textContent = productivity + "%";
    document.getElementById("studyOutput").textContent = study + " hrs";
    document.getElementById("recommendationOutput").textContent = recommendation;

    // RESET INPUTS
    document.getElementById("studyHours").value = "";
    document.getElementById("sleepHours").value = "";
    document.getElementById("breaksTaken").value = "";
    document.getElementById("stressLevel").value = "";

    // RE-RENDER HISTORY
    renderLogs();
});




function renderLogs() {

    let historyBox = document.getElementById("historyOutput");

    historyBox.innerHTML = "";

    logs.slice().reverse().forEach((log, index) => {

        historyBox.innerHTML += `
            <div class="border-b py-2 text-sm text-gray-600">
                Entry ${logs.length - index} → 
                Study: ${log.study}h | Sleep: ${log.sleep}h | Breaks: ${log.breaks} | Stress: ${log.stress} | Burnout: ${log.burnout} | Score: ${log.productivity}%
            </div>
        `;
    });
}



window.addEventListener("load", function () {
    renderLogs();
});




function showSection(section) {

    document.getElementById("dashboardSection").classList.add("hidden");
    document.getElementById("recommendationsSection").classList.add("hidden");
    document.getElementById("historySection").classList.add("hidden");

    const target = document.getElementById(section + "Section");

    if (target) {
        target.classList.remove("hidden");
    }
}
