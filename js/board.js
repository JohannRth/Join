/**
 * Array to store all tasks.
 * @type {Array}
 */
let todos = [];

/**
 * Initializes the application once the DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();
    await loadPositionsFromFirebase();
    await loadSubtaskStatusesFromFirebase();
    updateHTML();
    initializeDragAreas();
});

/**
 * Initializes drag areas by adding event listeners for drag and drop functionality.
 */
function initializeDragAreas() {
    const dragAreas = document.querySelectorAll(".drag-area");

    dragAreas.forEach((area) => {
        area.addEventListener("dragover", allowDrop);
        area.addEventListener("drop", dropTask);
        area.addEventListener("dragenter", () => area.classList.add("highlight"));
        area.addEventListener("dragleave", () => area.classList.remove("highlight"));
    });
}

/**
 * Loads tasks from Firebase and updates the local `todos` array.
 * Also updates the HTML display.
 */
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
        console.error("Error loading data from Firebase:", error);
    }
}

/**
 * Extracts initials from a full name string.
 * @param {string} name - The full name.
 * @returns {string} The initials.
 */
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    const nameParts = name.trim().split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

/**
 * Handles the click event on the input field, focusing and styling it.
 */
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

// Drag area counters

/**
 * Retrieves the count of tasks in the 'todo' category.
 * @returns {number} The number of 'todo' tasks.
 */
function getTodoCount() {
    const todoContainer = document.getElementById("todo");
    const tasks = todoContainer.querySelectorAll(".titel-card");
    return tasks.length;
}

/**
 * Updates the 'todo' task count in local storage.
 */
function updateTodoCount() {
    const todoCount = getTodoCount();
    localStorage.setItem('todoCount', todoCount);
}

/**
 * Retrieves the count of tasks in the 'done' category.
 * @returns {number} The number of 'done' tasks.
 */
function getDoneCount() {
    const doneContainer = document.getElementById("done");
    const tasks = doneContainer.querySelectorAll(".titel-card");
    return tasks.length;
}

/**
 * Updates the 'done' task count in local storage.
 */
function updateDoneCount() {
    const doneCount = getDoneCount();
    localStorage.setItem('doneCount', doneCount);
}

/**
 * Calculates the total number of tasks across all categories.
 * @returns {number} The total number of tasks.
 */
function getBoardTaskCount() {
    const todoTasks = document.getElementById("todo").querySelectorAll(".titel-card");
    const inProgressTasks = document.getElementById("inProgress").querySelectorAll(".titel-card");
    const feedbackTasks = document.getElementById("awaitFeedback").querySelectorAll(".titel-card");
    const doneTasks = document.getElementById("done").querySelectorAll(".titel-card");

    const totalTasks = todoTasks.length + inProgressTasks.length + feedbackTasks.length + doneTasks.length;
    return totalTasks;
}

/**
 * Updates the total task count in local storage.
 */
function updateBoardTaskCount() {
    const boardTaskCount = getBoardTaskCount();
    localStorage.setItem('boardTaskCount', boardTaskCount);
}

/**
 * Retrieves the count of tasks in the 'inProgress' category.
 * @returns {number} The number of 'inProgress' tasks.
 */
function getInProgressCount() {
    const inProgressTasks = document.getElementById("inProgress").querySelectorAll(".titel-card");
    return inProgressTasks.length;
}

/**
 * Updates the 'inProgress' task count in local storage.
 */
function updateInProgressCount() {
    const inProgressCount = getInProgressCount();
    localStorage.setItem('inProgressCount', inProgressCount);
}

/**
 * Retrieves the count of tasks in the 'awaitFeedback' category.
 * @returns {number} The number of 'awaitFeedback' tasks.
 */
function getAwaitFeedbackCount() {
    const feedbackTasks = document.getElementById("awaitFeedback").querySelectorAll(".titel-card");
    return feedbackTasks.length;
}

/**
 * Updates the 'awaitFeedback' task count in local storage.
 */
function updateAwaitFeedbackCount() {
    const feedbackCount = getAwaitFeedbackCount();
    localStorage.setItem('feedbackCount', feedbackCount);
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();
    await loadPositionsFromFirebase();
    await loadSubtaskStatusesFromFirebase();
    updateHTML();
});

// Task position management

/**
 * Saves the position (category) of a task to Firebase.
 * @param {string} taskId - The unique ID of the task.
 * @param {string} position - The new position/category of the task.
 */
async function savePosition(taskId, position) {
    const path = `positionDropArea/${taskId}`;
    await updateData(path, position);
}

/**
 * Loads task positions from Firebase and updates the local tasks accordingly.
 */
async function loadPositionsFromFirebase() {
    try {
        const positionsData = await loadData("positionDropArea");

        todos = todos.map((task) => {
            const position = positionsData[task.id] || task.category; // Fallback zur aktuellen Kategorie
            return { ...task, category: position };
        });
    } catch (error) {
        
    }
}
// Cross-link functionality

document.addEventListener("DOMContentLoaded", () => {
    const crossTitleButtons = document.querySelectorAll(".cross-titel-button");

    crossTitleButtons.forEach(button => {
        button.addEventListener("click", openAddTaskOverlay);
    });
});

/**
 * Opens the "Add Task" overlay and prevents body scrolling.
 */
function openAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    overlay.classList.remove("hidden");
    document.body.classList.add("no-scroll");
}

/**
 * Filters tasks based on the user's input in the search field
 * and ensures a "No tasks" div is displayed for empty categories.
 */
function filterTasks() {
    const inputField = document.querySelector('.input-find-task');
    const filterText = inputField.value.toLowerCase().trim(); // Benutzereingabe
    const categories = ['todo', 'inProgress', 'awaitFeedback', 'done']; // IDs der Kategorien

    categories.forEach(category => {
        const container = document.getElementById(category); // Container für die Kategorie
        const taskCards = container.querySelectorAll('.titel-card'); // Alle Task-Karten in der Kategorie

        let hasVisibleTasks = false; // Flag, ob mindestens eine Karte sichtbar ist

        // Filter auf alle Karten in der Kategorie anwenden
        taskCards.forEach(card => {
            const titleElement = card.querySelector('.task-title');
            const descriptionElement = card.querySelector('.task-description');

            // Sicherheitsprüfung, falls Elemente fehlen
            const title = titleElement ? titleElement.innerText.toLowerCase() : '';
            const description = descriptionElement ? descriptionElement.innerText.toLowerCase() : '';

            // Überprüfen, ob Titel oder Beschreibung den Filtertext enthält
            if (!filterText || title.includes(filterText) || description.includes(filterText)) {
                card.style.display = 'block'; // Karte anzeigen
                hasVisibleTasks = true; // Mindestens eine Karte sichtbar
            } else {
                card.style.display = 'none'; // Karte ausblenden
            }
        });

        // "No tasks"-Div einfügen oder entfernen, basierend auf der Sichtbarkeit
        const noTasksDiv = container.querySelector('.no-tasks');
        if (!hasVisibleTasks) {
            if (!noTasksDiv) {
                const newNoTasksDiv = document.createElement('div');
                newNoTasksDiv.className = 'no-tasks';
                newNoTasksDiv.innerText = `No tasks in ${category.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
                container.appendChild(newNoTasksDiv);
            }
        } else {
            if (noTasksDiv) {
                noTasksDiv.remove();
            }
        }
    });
}

document.querySelector('.input-find-task').addEventListener('input', filterTasks);

document.addEventListener('click', function (event) {
    const inputField = document.querySelector('.input-find-task');
    const inputWrapper = document.querySelector('.input-field-complett');

    if (!inputWrapper.contains(event.target)) {
        inputField.value = '';
        filterTasks();
    }
});

function handleResize() {
    const divs = document.querySelectorAll(".clickable");

    divs.forEach(div => {
        if (window.innerWidth < 1070) {
            div.onclick = function() {
                window.location.href = 'addTask.html';
            };
        } else {
            div.onclick = function() {
                openAddTaskOverlay();
            };
        }
    });
}

window.addEventListener("resize", handleResize);
window.addEventListener("load", handleResize);