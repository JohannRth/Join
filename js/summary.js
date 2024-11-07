
/////Beim Laden der Seite den  Benutzernamen aus dem LocalStorage auslesen und im Begrüßungselement mit entsrpechender Begrüßung anzeigen////////////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    // Überprüfen, ob ein Benutzer im localStorage gespeichert ist
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser && loggedInUser.name) {
        // Benutzernamen anzeigen
        document.getElementById('greetUser').textContent = loggedInUser.name;
    } else {
        // Falls kein Benutzer eingeloggt ist, Weiterleitung zur Login-Seite
        window.location.href = 'index.html';
    }
});

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
        return 'Good morning,';
    } else if (hour < 18) {
        return 'Good afternoon,';
    } else {
        return 'Good evening,';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // ... Ihr bestehender Code ...

    // Begrüßung setzen
    document.querySelector('.greet-time').textContent = getGreeting();
    // Lade die Anzahl der "Urgent"-Aufgaben und das nächste Fälligkeitsdatum
    const urgentCount = localStorage.getItem("urgentCount") || 0;
    const nearestDeadline = localStorage.getItem("nearestDeadline") || "No upcoming deadline";

    // Zeige die Anzahl der "Urgent"-Aufgaben an
    document.querySelector(".urgent-number").innerText = urgentCount;

    // Zeige das nächste Fälligkeitsdatum an
    document.getElementById("datum").innerText = nearestDeadline ? new Date(nearestDeadline).toLocaleDateString('de-DE') : "Keine Frist";
});

/////////////////////////////////////////////////////////////////////////////////////////
// Datum //
const heute = new Date();

const options = { year: 'numeric', month: 'long', day: 'numeric' };

const formatiertesDatum = heute.toLocaleDateString('en-US', options);

document.getElementById('datum').innerText = formatiertesDatum;
// Datum //

// Redirect to 'board.html' when containers are clicked
document.querySelector('.toDo-container').addEventListener('click', function () {
    window.location.href = 'board.html';
});

document.querySelector('.done-container').addEventListener('click', function () {
    window.location.href = 'board.html';
});

document.querySelector('.urgent-date-container').addEventListener('click', function () {
    window.location.href = 'board.html';
});

document.querySelector('.board-task-container').addEventListener('click', function () {
    window.location.href = 'board.html';
});

document.querySelector('.progress-task-container').addEventListener('click', function () {
    window.location.href = 'board.html';
});

document.querySelector('.feedback-task-container').addEventListener('click', function () {
    window.location.href = 'board.html';
});

// Drag-Area zähler //
document.addEventListener("DOMContentLoaded", function () {
    const todoCount = localStorage.getItem('todoCount') || 0; // Für Todo
    document.querySelector(".todo-number").innerText = todoCount;

    const doneCount = localStorage.getItem('doneCount') || 0; // Für Done
    document.querySelector(".done-number").innerText = doneCount;

    const boardTaskCount = localStorage.getItem('boardTaskCount') || 0; // Gesamtzahl 
    document.querySelector(".board-number").innerText = boardTaskCount;

    const inProgressCount = localStorage.getItem('inProgressCount') || 0; // In Progress
    document.querySelector(".progress-number").innerText = inProgressCount;

    const feedbackCount = localStorage.getItem('feedbackCount') || 0; // Await Feedback
    document.querySelector(".feedback-number").innerText = feedbackCount;
});
