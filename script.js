let startTime = null;
let endTime = null;
let agendaCount = 0;
let agendas = [];
let isMeetingRunning = false; // Tracks if the meeting has started

// 1. Initialize the first agenda immediately when the app loads
document.addEventListener('DOMContentLoaded', () => {
    addAgenda();
});

// 2. Add New Agenda Column
function addAgenda() {
    agendaCount++;
    const canvas = document.getElementById("agenda-canvas");

    const column = document.createElement("div");
    column.className = "agenda-column";

    column.innerHTML = `
        <div class="agenda-header">Agenda #${agendaCount}</div>
        <input type="text" class="agenda-title" placeholder="Agenda Title">
        <div class="quill-wrapper">
            <div class="editor"></div>
        </div>
    `;

    canvas.appendChild(column);

    // Initialize the Quill editor strictly on this new column
    const editorElement = column.querySelector('.editor');
    const quill = new Quill(editorElement, {
        theme: 'snow',
        placeholder: 'Type meeting notes here...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }]
            ]
        }
    });

    agendas.push({ column, quill });
    canvas.scrollLeft = canvas.scrollWidth;
}

// 3. Remove Agenda Column
function removeAgenda() {
    if (agendas.length > 1) {
        const lastAgenda = agendas.pop();
        lastAgenda.column.remove();
        agendaCount--;
    }
}

// 4. Time Tracking & Validation Logic
function startMeeting() {
    if (isMeetingRunning) return; // Prevents clicking start multiple times

    const now = new Date();
    startTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    isMeetingRunning = true;

    // Visual feedback for the Start button
    const startBtn = document.getElementById("start-btn");
    startBtn.innerHTML = `Started at: <strong>${startTime}</strong>`;
    startBtn.style.backgroundColor = '#d4edda'; // Soft green
    startBtn.style.borderColor = '#c3e6cb';
    startBtn.style.color = '#155724';
}

function endMeetingAndExport() {
    // Validation: Check if the meeting ever started
    if (!isMeetingRunning) {
        alert("You cannot end a meeting that hasn't started yet! Please click 'Start Meeting' first.");
        return;
    }

    const now = new Date();
    endTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    compileMinutes();
    resetMeeting();
}

// Resets the button and state after exporting
function resetMeeting() {
    isMeetingRunning = false;
    startTime = null;
    endTime = null;

    // Revert the Start button back to its default styling
    const startBtn = document.getElementById("start-btn");
    startBtn.textContent = "Start Meeting";
    startBtn.style.backgroundColor = '#f8f9fa';
    startBtn.style.borderColor = '#dcdcdc';
    startBtn.style.color = '#333';
}

// 5. File Compilation and Export (HTML version)
function compileMinutes() {
    let output = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Minutes of Meeting</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; color: #333; padding: 20px; }
            h1 { text-align: center; border-bottom: 2px solid #eaeaea; padding-bottom: 10px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .agenda-block { border: 1px solid #eaeaea; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #fafafa; }
            .agenda-title { font-weight: bold; font-size: 1.2em; margin-bottom: 15px; border-bottom: 1px solid #eaeaea; padding-bottom: 10px; }
            ul, ol { margin-top: 0; }
        </style>
    </head>
    <body>
        <h1>MINUTES OF MEETING</h1>
        
        <div class="section">
            <p><strong>START TIME:</strong> ${startTime}</p>
            <p><strong>END TIME:</strong> ${endTime}</p>
        </div>
        
        <div class="section">
            <h2>ATTENDANCE</h2>
            <ul>
    `;

    const checkboxes = document.querySelectorAll(".officer");
    let attendeesFound = false;

    checkboxes.forEach(box => {
        if (box.checked) {
            const labelText = box.parentElement.textContent.trim();
            output += `<li>${labelText}</li>\n`;
            attendeesFound = true;
        }
    });

    if (!attendeesFound) output += "<li>No attendance recorded.</li>\n";
    output += `</ul></div>\n`;

    output += `<div class="section"><h2>AGENDAS</h2>\n`;

    agendas.forEach((agendaObj, index) => {
        const title = agendaObj.column.querySelector(".agenda-title").value.trim() || "Untitled Agenda";
        const notesHTML = agendaObj.quill.root.innerHTML;

        output += `
        <div class="agenda-block">
            <div class="agenda-title">AGENDA #${index + 1}: ${title}</div>
            <div>${notesHTML}</div>
        </div>\n`;
    });

    output += `</div></body></html>`;

    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `Meeting_Minutes_${dateStr}.html`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}