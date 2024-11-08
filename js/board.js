// titel carde  
let todos = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase(); // Lade die Todos
    await loadPositionsFromFirebase(); // Lade Positionen
    await loadSubtaskStatusesFromFirebase(); // Lade Subtask-Status
    updateHTML(); // Aktualisiere das HTML
    initializeDragAreas(); // Initialisiere Drag & Drop-Bereiche
});

function initializeDragAreas() {
    const dragAreas = document.querySelectorAll(".drag-area");
    dragAreas.forEach((area) => {
        area.addEventListener("dragover", allowDrop);
        area.addEventListener("drop", dropTask);
    });
}

async function loadTodosFromFirebase() {
    try {
        const tasksData = await loadData("tasks");
        const subtaskStatusData = await loadData("subtaskStatus"); // Lade Subtask-Status

        todos = Object.keys(tasksData).map((key) => {
            const task = tasksData[key];
            const subtasks = task.subtasks
                ? Object.entries(task.subtasks).map(([index, title]) => ({
                    title: title || "Untitled Subtask",
                    completed: subtaskStatusData[key] && subtaskStatusData[key][index]
                        ? subtaskStatusData[key][index].completed
                        : false
                }))
                : [];

            return {
                id: key,
                titel: task.title || "Untitled",
                type: task.category || "General",
                category: task.type || "todo",
                description: task.description || "No description",
                priority: task.prio || "low",
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                subtasks: subtasks,
                completedSubtasks: subtasks.filter(st => st.completed).length,
                contacts: task.assignedTo ? task.assignedTo.map(name => name.trim()) : []
            };
        });

        // Berechne die Anzahl und das nächste Fälligkeitsdatum der "Urgent"-Aufgaben
        const urgentTasks = todos.filter(task => task.priority === "urgent");
        const urgentCount = urgentTasks.length;
        const nearestDeadline = urgentTasks
            .filter(task => task.dueDate) // nur Aufgaben mit Datum
            .sort((a, b) => a.dueDate - b.dueDate) // Sortiere nach Datum
            .map(task => task.dueDate)[0]; // Nimm das früheste Datum

        // Speichere die Werte in localStorage
        localStorage.setItem("urgentCount", urgentCount);
        localStorage.setItem("nearestDeadline", nearestDeadline ? nearestDeadline.toISOString().split("T")[0] : "");

        updateHTML();
    } catch (error) {
        console.error("Fehler beim Laden der Daten aus Firebase:", error);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function dragTask(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add("dragging");
    ev.target.style.cursor = "grabbing";
}

// Funktion zum Erhalten der Initialen des Vor- und Nachnamens
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    const nameParts = name.trim().split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Anpassung der generateTodoHTML-Funktion
function generateTodoHTML(element) {
    console.log("Element an generateTodoHTML übergeben:", element);

    const taskTypeStyle = element.type === "Technical Task"
        ? `height: 27px; width: 144px; border-radius: 8px; padding: 4px 16px; background-color: #1FD7C1; color: #FFFFFF; font-size: 16px; font-weight: 400;`
        : `width: 113px; height: 27px; border-radius: 8px; padding: 4px 16px; background-color: #0038ff; color: white; font-weight: 400; font-size: 16px; display: flex; align-items: center; justify-content: center;`;

    // Fortschrittsdaten berechnen
    const completed = element.completedSubtasks || 0;
    const totalSubtasks = element.subtasks ? element.subtasks.length : 0;
    const percentage = totalSubtasks > 0 ? (completed / totalSubtasks) * 100 : 0;

    let progressHTML = "";
    if (totalSubtasks > 0) {
        progressHTML = `
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="progress-text">${completed}/${totalSubtasks} Subtasks</span>
            </div>
        `;
    } else {
        progressHTML = `<div class="task-progress-placeholder"></div>`;
    }

    let priorityIcon = "";
    if (element.priority === "urgent") {
        priorityIcon = `<img src="./assets/img/urgent-titel-card.svg" alt="Urgent Priority" />`;
    } else if (element.priority === "medium") {
        priorityIcon = `<img src="./assets/img/medium-titel-card.svg" alt="Medium Priority" />`;
    } else if (element.priority === "low") {
        priorityIcon = `<img src="./assets/img/low-titel-card.svg" alt="Low Priority" />`;
    } else {
        priorityIcon = `<img src="./assets/img/default-titel-card.svg" alt="Default Priority" />`;
    }

    let contactsHTML = "";
    if (element["contacts"]) {
        contactsHTML = `
            <div class="task-assigned">
                ${element["contacts"]
                .map(contact => {
                    const initials = getInitials(contact);
                    const color = getColor(contact);
                    return `<span class="person-circle" style="background-color: ${color};">${initials}</span>`;
                })
                .join("")}
            </div>
        `;
    }

    return `
        <div id="${element["id"]}" class="titel-card" draggable="true" ondragstart="dragTask(event)" onclick="openCardOverlay('${element["id"]}')">
            <div class="user-story" style="${taskTypeStyle}">${element["type"]}</div>
            <div class="task-details">
                <h3 class="task-title">${element["titel"]}</h3>
                <p class="task-description">${element["description"]}</p>
            </div>
            ${progressHTML}
            ${contactsHTML}
            <div class="priority-icon">
                ${priorityIcon}
            </div>
        </div>`;
}

function dropTask(ev) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text");
    const taskElement = document.getElementById(taskId);
    const newCategory = ev.currentTarget.id;

    ev.currentTarget.appendChild(taskElement);
    taskElement.classList.remove("dragging");

    // Speichere die Position in Firebase unter `positionDropArea`
    savePosition(taskId, newCategory);

    // Lokale Änderungen, falls nötig
    todos = todos.map((task) =>
        task.id == taskId ? { ...task, category: newCategory } : task
    );

    updateTodoCount();
    updateDoneCount();
    updateBoardTaskCount();
    updateInProgressCount();
    updateAwaitFeedbackCount();
    updateHTML();
}

// Setze den Cursor zurück, wenn das Draggen beendet wird
document.addEventListener("dragend", function (event) {
    event.target.classList.remove("dragging");
});

function updateHTML() {
    // To-Do Category
    let todoTasks = todos.filter((t) => t["category"] === "todo");
    let todoContainer = document.getElementById("todo");
    todoContainer.innerHTML = "";

    if (todoTasks.length === 0) {
        todoContainer.innerHTML = `<div class="no-tasks">No tasks To do</div>`;
    } else {
        todoTasks.forEach((task) => {
            todoContainer.innerHTML += generateTodoHTML(task);
        });
    }

    // In-Progress Category
    let inProgressTasks = todos.filter(
        (t) => t["category"] === "inProgress"
    );
    let inProgressContainer = document.getElementById("inProgress");
    inProgressContainer.innerHTML = "";

    if (inProgressTasks.length === 0) {
        inProgressContainer.innerHTML = `<div class="no-tasks">No tasks In progress</div>`;
    } else {
        inProgressTasks.forEach((task) => {
            inProgressContainer.innerHTML += generateTodoHTML(task);
        });
    }

    // Await Feedback Category
    let feedbackTasks = todos.filter(
        (t) => t["category"] === "awaitFeedback"
    );
    let feedbackContainer = document.getElementById("awaitFeedback");
    feedbackContainer.innerHTML = "";

    if (feedbackTasks.length === 0) {
        feedbackContainer.innerHTML = `<div class="no-tasks">No tasks Await feedback</div>`;
    } else {
        feedbackTasks.forEach((task) => {
            feedbackContainer.innerHTML += generateTodoHTML(task);
        });
    }

    // Done Category
    let doneTasks = todos.filter((t) => t["category"] === "done");
    let doneContainer = document.getElementById("done");
    doneContainer.innerHTML = "";

    if (doneTasks.length === 0) {
        doneContainer.innerHTML = `<div class="no-tasks">No tasks Done</div>`;
    } else {
        doneTasks.forEach((task) => {
            doneContainer.innerHTML += generateTodoHTML(task);
        });
    }
}

// Edit Card //

// Funktion zum Öffnen des Edit-Overlays und Laden der aktuellen Task-Daten
function openEditOverlay(taskId) {
    // Finde die Aufgabe basierend auf der taskId
    const task = todos.find(t => t.id === taskId);
    if (!task) {
        console.error("Task nicht gefunden:", taskId);
        return;
    }


    const editOverlay = document.getElementById("edit-overlay");
    editOverlay.classList.remove("hidden");

    document.body.classList.add("no-scroll");
}

// Funktion zum Schließen des Edit-Overlays
function closeEditOverlay() {
    const editOverlay = document.getElementById("edit-overlay");
    editOverlay.classList.add("hidden");

    document.body.classList.remove("no-scroll");
}

//außerhalb klicken schliessen //
document.getElementById("edit-overlay").addEventListener("click", function (event) {
    if (event.target === this) {
        closeEditOverlay();
    }
});

// Edit Card //

// ExpandedCard
function generateExpandedCardHTML(element) {
    const taskTypeStyle = element.type === "Technical Task"
        ? `height: 36px; width: 208px; border-radius: 8px; padding: 4px 16px; background-color: #1FD7C1; color: #FFFFFF; font-size: 23px; font-weight: 400;`
        : `width: 164px; height: 36px; border-radius: 8px; padding: 4px 16px; background-color: #0038ff; color: white; font-weight: 400; font-size: 23px; display: flex; align-items: center; justify-content: center;`;

    let priorityLabel = "";
    let priorityIconSrc = "";
    if (element.priority === "urgent") {
        priorityLabel = "Urgent";
        priorityIconSrc = "./assets/img/urgent-titel-card.svg";
    } else if (element.priority === "medium") {
        priorityLabel = "Medium";
        priorityIconSrc = "./assets/img/medium-titel-card.svg";
    } else if (element.priority === "low") {
        priorityLabel = "Low";
        priorityIconSrc = "./assets/img/low-titel-card.svg";
    } else {
        priorityLabel = "Default";
        priorityIconSrc = "./assets/img/default-titel-card.svg";
    }

    const dueDate = element.dueDate ? new Date(element.dueDate).toLocaleDateString("de-DE") : "Kein Datum";

    const subtasksHTML = element.subtasks.map((subtask, index) => `
    <div class="subtask-item" style="display: flex; align-items: center; gap: 16px;">
        <input type="checkbox" 
               id="subtask-checkbox-${element.id}-${index}" 
               onclick="toggleSubtask('${element.id}', ${index})" 
               class="styled-checkbox"
               ${subtask.completed ? "checked" : ""}>
        <label for="subtask-checkbox-${element.id}-${index}">${subtask.title}</label> <!-- Achte hier auf subtask.title -->
    </div>
`).join('');

    return `
    <div class="around-container-epended-card">    
      <div class="expanded-card-overlay">
        <div class="close-story-container-overlay">
            <div class="user-story-overlay" style="${taskTypeStyle}">${element["type"]}</div>
            <img src="./assets/img/close.svg" alt="close" class="close-btn-overlay" onclick="closeCardOverlay()">
        </div>
        <div class="task-title-overlay">${element["titel"]}</div>
        <div class="task-description-overlay">${element["description"]}</div>
        <div class="due-date-overlay">
            <span class="date-line-overlay">Due date:</span>
            <span class="date-date-overlay">${dueDate}</span>
        </div>
        <div class="priority-container-overlay">
            <span class="priority-line-overlay">Priority:</span>
            <div class="priority-focus-img-container">
                <span class="priority-focus-overlay">${priorityLabel}</span>
                <img src="${priorityIconSrc}" alt="Priority ${priorityLabel}" class="priority-img-overlay">
            </div>    
        </div>
        <span class="task-assigned-line-overlay">Assigned To:</span>
        <div class="task-assigned-container-overlay">
                ${element.contacts.map(contact => `
                <div class="person-container-overlay">
                    <span class="person-circle-overlay" style="background-color: ${getColor(contact)};">${getInitials(contact)}</span>
                    <span class="person-name-overlay">${contact}</span>
                </div>
            `).join('')}
        </div>
        <div class="subtask-conatiner-overlay">
            <span class="subtask-line-overlay">Subtasks:</span>
            <div class="subtasks-box-overlay">
                ${subtasksHTML}
            </div>
        </div>
         <div class="actions-overlay">
            <p class="action-btn-overlay" onclick="deleteTask('${element.id}')">
                <img src="./assets/img/delete.svg" alt="delete">Delete
            </p>
            <img src="./assets/img/sep-delet-edit.svg" alt="delete">
            <p class="action-btn-overlay"onclick="openEditOverlay('${element.id}')">
                <img src="./assets/img/edit.svg" alt="edit">Edit
            </p>
        </div>
      </div>
    </div> `;
}

// Subtasks //
async function toggleSubtask(taskId, subtaskIndex) {
    const task = todos.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
        console.error("Subtask nicht gefunden oder ungültiger Index:", taskId, subtaskIndex);
        return;
    }

    // Status umschalten
    const subtask = task.subtasks[subtaskIndex];
    subtask.completed = !subtask.completed;

    // Speichere den neuen Status in `subtaskStatus` in Firebase
    await saveSubtaskStatus(taskId, subtaskIndex, subtask.completed);

    // Aktualisiere die Anzahl abgeschlossener Subtasks
    task.completedSubtasks = task.subtasks.filter(st => st.completed).length;

    // Berechne das Fortschrittsverhältnis und aktualisiere die progressBar
    const totalSubtasks = task.subtasks.length;
    const percentage = totalSubtasks > 0 ? (task.completedSubtasks / totalSubtasks) * 100 : 0;

    updateProgressBar(taskId, percentage, task.completedSubtasks, totalSubtasks);
}

async function saveSubtaskStatus(taskId, subtaskIndex, isChecked) {
    const path = `subtaskStatus/${taskId}/${subtaskIndex}`;
    console.log(`Speichere Subtask-Status an Pfad ${path}:`, isChecked);
    await updateData(path, { completed: isChecked });
}

async function loadSubtaskStatusesFromFirebase() {
    const subtaskStatuses = await loadData("subtaskStatus");

    // Zuweisung des Subtask-Status in `todos`
    todos.forEach(task => {
        if (subtaskStatuses[task.id]) {
            task.subtasks.forEach((subtask, index) => {
                if (subtaskStatuses[task.id][index] !== undefined) {
                    subtask.completed = subtaskStatuses[task.id][index].completed || false;
                }
            });
        }
    });
}

// Subtasks //

//Progress Bar //
function updateProgressBar(taskId, percentage, completed, total) {
    const taskElement = document.getElementById(taskId);
    if (!taskElement) return;

    const progressBar = taskElement.querySelector(".progress-fill");
    const progressText = taskElement.querySelector(".progress-text");

    if (progressBar && progressText) {
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${completed}/${total} Subtasks`;
    }
}
//Progress Bar //
//card-overlay
function openCardOverlay(taskId) {
    const overlay = document.getElementById("card-overlay");
    const task = todos.find((t) => t.id === taskId); // Hier wird die id als String verglichen
    overlay.innerHTML = generateExpandedCardHTML(task);
    overlay.classList.remove("hidden");

    document.body.classList.add("no-scroll");

    // Hinzufügen des taskId als Attribut für Delete-Button
    const deleteButton = overlay.querySelector(".action-btn-overlay");
    deleteButton.setAttribute("onclick", `deleteTask('${taskId}')`);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            closeCardOverlay();
        }
    });
}

function closeCardOverlay() {
    const overlay = document.getElementById("card-overlay");
    overlay.classList.add("hidden");

    document.body.classList.remove("no-scroll");
}

function handleInputClick() {
    const inputWrapper = document.querySelector('.input-field-complett');


    inputWrapper.classList.add('focused');


    const inputField = document.querySelector('.input-find-task');
    inputField.setAttribute('placeholder', '');
}


document.addEventListener('click', function (event) {
    const inputWrapper = document.querySelector('.input-field-complett');
    const inputField = document.querySelector('.input-find-task');


    if (!inputWrapper.contains(event.target)) {
        inputWrapper.classList.remove('focused');


        if (!inputField.value) {
            inputField.setAttribute('placeholder', 'Find Task');
        }
    }
});

// Drag-Area zähler //

function getTodoCount() { // ToDo
    const todoContainer = document.getElementById("todo");
    const tasks = todoContainer.querySelectorAll(".titel-card");
    return tasks.length;
}

function updateTodoCount() {
    const todoCount = getTodoCount();
    localStorage.setItem('todoCount', todoCount);
}

function getDoneCount() { // Done
    const doneContainer = document.getElementById("done");
    const tasks = doneContainer.querySelectorAll(".titel-card");
    return tasks.length;
}

function updateDoneCount() {
    const doneCount = getDoneCount();
    localStorage.setItem('doneCount', doneCount);
}

function getBoardTaskCount() { // Alle
    const todoTasks = document.getElementById("todo").querySelectorAll(".titel-card");
    const inProgressTasks = document.getElementById("inProgress").querySelectorAll(".titel-card");
    const feedbackTasks = document.getElementById("awaitFeedback").querySelectorAll(".titel-card");
    const doneTasks = document.getElementById("done").querySelectorAll(".titel-card");

    const totalTasks = todoTasks.length + inProgressTasks.length + feedbackTasks.length + doneTasks.length;
    return totalTasks;
}

function updateBoardTaskCount() {
    const boardTaskCount = getBoardTaskCount();
    localStorage.setItem('boardTaskCount', boardTaskCount);
}

function getInProgressCount() { // In Progress
    const inProgressTasks = document.getElementById("inProgress").querySelectorAll(".titel-card");
    return inProgressTasks.length;
}

function updateInProgressCount() {
    const inProgressCount = getInProgressCount();
    localStorage.setItem('inProgressCount', inProgressCount);
}

function getAwaitFeedbackCount() { // Await Feedback
    const feedbackTasks = document.getElementById("awaitFeedback").querySelectorAll(".titel-card");
    return feedbackTasks.length;
}

function updateAwaitFeedbackCount() {
    const feedbackCount = getAwaitFeedbackCount();
    localStorage.setItem('feedbackCount', feedbackCount);
}

// Add Task Overlay Card //

function addTaskExpanded() {
    const overlay = document.getElementById('add-task-overlay');
    overlay.classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

function closeAddTaskOverlay(event) {
    const overlay = document.getElementById('add-task-overlay');
    if (event.target === overlay || event.target.classList.contains('close-btn-overlay')) {
        overlay.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();
    updateHTML();
});

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; // Standardfarbe
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
}

async function deleteTask(taskId) {
    // Finde die Aufgabe in `todos` und entferne sie
    todos = todos.filter(task => task.id !== taskId);

    // Lösche die Aufgabe in Firebase unter dem Pfad `tasks/taskId`
    const path = `tasks/${taskId}`;
    await deleteData(path);

    // Aktualisiere das HTML, um die gelöschte Aufgabe zu entfernen
    updateHTML();
    closeCardOverlay(); // Schließe das Overlay nach dem Löschen
}

async function deleteData(path) {
    try {
        const taskRef = firebase.database().ref(path);
        await taskRef.remove();
        console.log(`Task bei Pfad ${path} wurde erfolgreich gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen der Daten aus Firebase:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();         // Lade die `todos` Daten
    await loadPositionsFromFirebase();     // Lade und setze die Positionen
    await loadSubtaskStatusesFromFirebase(); // Lade und setze die Subtask-Checkbox-Status
    updateHTML();                          // Aktualisiere das HTML mit allen geladenen Daten
});

// Todo's position //
async function savePosition(taskId, position) {
    const path = `positionDropArea/${taskId}`;
    await updateData(path, position);
}

async function loadPositionsFromFirebase() {
    const positionsData = await loadData("positionDropArea");
    console.log("Geladene Positionen:", positionsData); // Debugging: Überprüfen der geladenen Positionen

    for (const taskId in positionsData) {
        const position = positionsData[taskId];
        const task = todos.find((t) => t.id === taskId || t.id === parseInt(taskId));

        if (task) {
            task.category = position; // Setze die Position basierend auf den Daten in `positionDropArea`
            console.log(`Task ${taskId} auf Position ${position} gesetzt`); // Debugging: Überprüfen der aktualisierten Positionen
        }
    }
}
// Todo's position //

// cross link //
document.addEventListener("DOMContentLoaded", () => {
    const crossTitleButtons = document.querySelectorAll(".cross-titel-button");

    crossTitleButtons.forEach(button => {
        button.addEventListener("click", openAddTaskOverlay);
    });
});

function openAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    overlay.classList.remove("hidden");
    document.body.classList.add("no-scroll"); // Verhindert das Scrollen im Hintergrund
}
