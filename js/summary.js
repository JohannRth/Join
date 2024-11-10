
/////Beim Laden der Seite den  Benutzernamen aus dem LocalStorage auslesen und im Begrüßungselement mit entsrpechender Begrüßung anzeigen////////////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    // Überprüfen, ob ein Benutzer im localStorage gespeichert ist
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser && loggedInUser.name) {
        // Benutzernamen anzeigen
        document.getElementById('greetUser').textContent = loggedInUser.name;
    } else {
        // Falls kein Benutzer eingeloggt ist, Weiterleitung zur Login-Seite
        //nur aktivieren wenn gar keiner auf legalNotice und privacyPolicy zugreifen soll--> window.location.href = 'index.html';
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

document.addEventListener('DOMContentLoaded', () => {
    initializeMainGreet();
    setGreeting();
    displayUrgentTasks();
    displayNearestDeadline();
});

/**
 * Initialisiert das .main-greet Element und setzt die Display-Eigenschaft basierend auf der Fensterbreite.
 */
function initializeMainGreet() {
    const mainGreet = document.querySelector('.main-greet');
    const debouncedUpdate = debounce(() => updateMainGreetDisplay(mainGreet), 200);

    // Initiale Anzeige basierend auf der aktuellen Fensterbreite
    updateMainGreetDisplay(mainGreet);

    // Event-Listener für das Ende der Animation
    mainGreet.addEventListener('animationend', (event) => handleAnimationEnd(event, mainGreet));

    // Event-Listener für das Ändern der Fenstergröße mit Debounce
    window.addEventListener('resize', debouncedUpdate);
}

/**
 * Aktualisiert die Display-Eigenschaft des .main-greet Elements basierend auf der Fensterbreite.
 * @param {HTMLElement} mainGreet - Das .main-greet DOM-Element.
 */
function updateMainGreetDisplay(mainGreet) {
    if (window.innerWidth > 1020) {
        mainGreet.style.display = 'flex';
        mainGreet.classList.remove('animate-hide');
    } else {
        if (mainGreet.style.display !== 'none') {
            mainGreet.style.display = 'flex';
            mainGreet.classList.add('animate-hide');
        }
    }
}

/**
 * Behandelt das Ende der Animation für das .main-greet Element.
 * @param {AnimationEvent} event - Das AnimationEnd-Ereignis.
 * @param {HTMLElement} mainGreet - Das .main-greet DOM-Element.
 */
function handleAnimationEnd(event, mainGreet) {
    if (event.target === mainGreet && window.innerWidth <= 1020) {
        mainGreet.style.display = 'none';
        mainGreet.classList.remove('animate-hide');
    }
}

/**
 * Setzt die Begrüßungsnachricht basierend auf der aktuellen Tageszeit.
 */
function setGreeting() {
    const greetTimeElement = document.querySelector('.greet-time');
    greetTimeElement.textContent = getGreeting();
}

/**
 * Zeigt die Anzahl der "Urgent"-Aufgaben an.
 */
function displayUrgentTasks() {
    const urgentCount = localStorage.getItem("urgentCount") || 0;
    const urgentNumberElement = document.querySelector(".urgent-number");
    urgentNumberElement.innerText = urgentCount;
}

/**
 * Zeigt das nächste Fälligkeitsdatum an.
 */
function displayNearestDeadline() {
    const nearestDeadline = localStorage.getItem("nearestDeadline") || "No upcoming deadline";
    const datumElement = document.getElementById("datum");
    datumElement.innerText = nearestDeadline !== "No upcoming deadline"
        ? new Date(nearestDeadline).toLocaleDateString('en-US') // Optional: 'de-DE' kann beibehalten werden, wenn das Datumsformat auf Deutsch bleiben soll
        : "No deadline";
}

/**
 * Generiert eine Begrüßungsnachricht basierend auf der aktuellen Uhrzeit.
 * @returns {string} Die Begrüßungsnachricht.
 */
function getGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good Morning!';
    if (currentHour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
}

/**
 * Fügt dem Resize-Event einen Debounce-Mechanismus hinzu.
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


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


