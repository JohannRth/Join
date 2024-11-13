document.addEventListener('DOMContentLoaded', function () {
    // Begrüßung initialisieren
    initializeMainGreet();
    setGreeting();

    // Aufgabenstatistiken aktualisieren
    updateSummary();

    // Event Listener für die Links hinzufügen
    initializeLinkListeners();
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

    // Benutzernamen anzeigen
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.name) {
        document.getElementById('greetUser').textContent = loggedInUser.name;
    } else {
        // Falls kein Benutzer eingeloggt ist, Weiterleitung zur Login-Seite
        // window.location.href = 'index.html';
    }
}

/**
 * Generiert eine Begrüßungsnachricht basierend auf der aktuellen Uhrzeit.
 * @returns {string} Die Begrüßungsnachricht.
 */
function getGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning,';
    if (currentHour < 18) return 'Good afternoon,';
    return 'Good evening,';
}

/**
 * Fügt dem Resize-Event einen Debounce-Mechanismus hinzu.
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Lädt die Aufgaben aus Firebase.
 * @returns {Promise<Array>} Liste der Aufgaben.
 */
async function loadTasksFromFirebase() {
    try {
        const tasksData = await loadData("tasks");
        const tasks = Object.keys(tasksData).map((key) => {
            const task = tasksData[key];
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return {
                id: key,
                title: task.title || "Untitled",
                description: task.description || "No description",
                priority: task.prio || "low",
                dueDate: dueDate,
                category: task.category || "todo",
                assignedTo: task.assignedTo || [],
                subtasks: task.subtasks || [],
            };
        });
        return tasks;
    } catch (error) {
        console.error("Fehler beim Laden der Aufgaben aus Firebase:", error);
        return [];
    }
}

/**
 * Lädt die Positionen der Aufgaben aus Firebase.
 * @returns {Promise<Object>} Positionen der Aufgaben.
 */
async function loadPositionsFromFirebase() {
    const positionsData = await loadData("positionDropArea");
    return positionsData || {};
}

/**
 * Berechnet die Aufgabenstatistiken.
 * @returns {Promise<Object>} Die berechneten Statistiken.
 */
async function calculateStatistics() {
    const tasks = await loadTasksFromFirebase();
    const positions = await loadPositionsFromFirebase();

    let todoCount = 0;
    let doneCount = 0;
    let inProgressCount = 0;
    let feedbackCount = 0;
    let urgentCount = 0;
    let nearestDeadline = null;

    tasks.forEach((task) => {
        const position = positions[task.id] || "todo"; // Standardmäßig "todo", falls keine Position vorhanden
        // Zähle die Aufgaben basierend auf ihrer Position
        if (position === "todo") {
            todoCount++;
        } else if (position === "done") {
            doneCount++;
        } else if (position === "inProgress") {
            inProgressCount++;
        } else if (position === "awaitFeedback") {
            feedbackCount++;
        }

        // Zähle die "Urgent"-Aufgaben
        if (task.priority === "urgent") {
            urgentCount++;
            // Überprüfe das Fälligkeitsdatum
            if (task.dueDate) {
                if (!nearestDeadline || task.dueDate < nearestDeadline) {
                    nearestDeadline = task.dueDate;
                }
            }
        }
    });

    // Gesamtzahl der Aufgaben im Board
    const boardTaskCount = tasks.length;

    return {
        todoCount,
        doneCount,
        inProgressCount,
        feedbackCount,
        urgentCount,
        nearestDeadline,
        boardTaskCount,
    };
}

/**
 * Aktualisiert die Zusammenfassungsstatistiken auf der Seite.
 */
async function updateSummary() {
    const stats = await calculateStatistics();

    // Update der Elemente im DOM
    document.querySelector(".todo-number").innerText = stats.todoCount;
    document.querySelector(".done-number").innerText = stats.doneCount;
    document.querySelector(".urgent-number").innerText = stats.urgentCount;
    document.querySelector(".board-number").innerText = stats.boardTaskCount;
    document.querySelector(".progress-number").innerText = stats.inProgressCount;
    document.querySelector(".feedback-number").innerText = stats.feedbackCount;

    // Nächstes Fälligkeitsdatum formatieren und anzeigen
    const datumElement = document.getElementById("datum");
    if (stats.nearestDeadline) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = stats.nearestDeadline.toLocaleDateString('de-DE', options);
        datumElement.innerText = formattedDate;
    } else {
        datumElement.innerText = "Keine bevorstehenden Deadlines";
    }
}

/**
 * Initialisiert die Event Listener für die Container, die zu 'board.html' weiterleiten.
 */
function initializeLinkListeners() {
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
}
