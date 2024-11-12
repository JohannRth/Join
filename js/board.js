let todos = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();
    await loadPositionsFromFirebase();
    await loadSubtaskStatusesFromFirebase();
    updateHTML();
    initializeDragAreas();
});

function initializeDragAreas() {
    const dragAreas = document.querySelectorAll(".drag-area");

    dragAreas.forEach((area) => {
        area.addEventListener("dragover", allowDrop);
        area.addEventListener("drop", dropTask);
        area.addEventListener("dragenter", () => area.classList.add("highlight"));
        area.addEventListener("dragleave", () => area.classList.remove("highlight"));
    });
}

async function loadTodosFromFirebase() {
    try {
        const tasksData = await loadData("tasks");
        const subtaskStatusData = await loadData("subtaskStatus");

        todos = Object.keys(tasksData).map((key) => {
            const task = tasksData[key];
            const subtasks = task.subtasks ? Object.entries(task.subtasks).map(([index, title]) => ({
                title: title || "Untitled Subtask",
                completed: subtaskStatusData[key] && subtaskStatusData[key][index] && subtaskStatusData[key][index].completed !== undefined
                    ? subtaskStatusData[key][index].completed
                    : false
            })) : [];
        
            const newSubtasks = task.newSubtask ? Object.entries(task.newSubtask).map(([index, title]) => ({
                title: title || "Untitled New Subtask",
                completed: subtaskStatusData[key] && subtaskStatusData[key][index] && subtaskStatusData[key][index].completed !== undefined
                    ? subtaskStatusData[key][index].completed
                    : false
            })) : [];
        
            return {
                id: key,
                titel: task.title || "Untitled",
                type: task.category || "General",
                category: task.type || "todo",
                description: task.description || "No description",
                priority: task.prio || "low",
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                subtasks: subtasks.concat(newSubtasks),
                completedSubtasks: subtasks.filter(st => st.completed).length,
                contacts: task.assignedTo ? task.assignedTo.map(name => name.trim()) : []
            };
        });
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

    ev.target.addEventListener("dragend", () => {
        const dragAreas = document.querySelectorAll(".drag-area");
        dragAreas.forEach((area) => area.classList.remove("highlight"));
    });
}

function dropTask(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const taskElement = document.getElementById(data);
    const targetArea = ev.target.closest(".drag-area");

    if (targetArea) {
        targetArea.classList.remove("highlight"); // Rand entfernen nach Drop
        targetArea.appendChild(taskElement); // Element in die Ziel-Div verschieben
    }
}

function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    const nameParts = name.trim().split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
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
    document.body.classList.add("no-scroll"); 
}
