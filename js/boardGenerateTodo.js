/**
 * Generates the HTML for a todo task card.
 * @param {Object} element - The task object containing task details.
 * @returns {string} The HTML string for the task card.
 */
function generateTodoHTML(element) {
    const taskTypeStyle = getTaskTypeStyle(element.type);
    const progressHTML = generateProgressHTML(element);
    const priorityIcon = getPriorityIcon(element.priority);
    const contactsHTML = generateContactsHTML(element);

    return generateTodoHTMLTemplate(element, taskTypeStyle, progressHTML, priorityIcon, contactsHTML);
}

/**
 * Generates the HTML template for a todo task card.
 * @param {Object} element - The task object.
 * @param {string} taskTypeStyle - The inline style for the task type.
 * @param {string} progressHTML - The HTML for the progress bar.
 * @param {string} priorityIcon - The HTML for the priority icon.
 * @param {string} contactsHTML - The HTML for the assigned contacts.
 * @returns {string} The complete HTML string for the task card.
 */
function generateTodoHTMLTemplate(element, taskTypeStyle, progressHTML, priorityIcon, contactsHTML) {
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

/**
 * Returns the inline CSS style string based on the task type.
 * @param {string} type - The type of the task.
 * @returns {string} The CSS style string.
 */
function getTaskTypeStyle(type) {
    return type === "Technical Task"
        ? "height: 27px; width: 144px; border-radius: 8px; padding: 4px 16px; background-color: #1FD7C1; color: #FFFFFF; font-size: 16px; font-weight: 400;"
        : "width: 113px; height: 27px; border-radius: 8px; padding: 4px 16px; background-color: #0038ff; color: white; font-weight: 400; font-size: 16px; display: flex; align-items: center; justify-content: center;";
}

/**
 * Generates the HTML for the progress bar of a task.
 * @param {Object} element - The task object containing subtasks.
 * @returns {string} The HTML string for the progress bar.
 */
function generateProgressHTML(element) {
    const completed = element.completedSubtasks || 0;
    const total = element.subtasks ? element.subtasks.length : 0;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return total > 0
        ? `<div class="task-progress">
               <div class="progress-bar">
                   <div class="progress-fill" style="width: ${percentage}%"></div>
               </div>
               <span class="progress-text">${completed}/${total} Subtasks</span>
           </div>`
        : `<div class="task-progress-placeholder"></div>`;
}

/**
 * Retrieves the priority icon HTML based on the priority level.
 * @param {string} priority - The priority level ('urgent', 'medium', 'low').
 * @returns {string} The HTML string for the priority icon.
 */
function getPriorityIcon(priority) {
    const icons = {
        urgent: "./assets/img/urgent-titel-card.svg",
        medium: "./assets/img/medium-titel-card.svg",
        low: "./assets/img/low-titel-card.svg",
        default: "./assets/img/default-titel-card.svg",
    };
    return `<img src="${icons[priority] || icons.default}" alt="${priority || "Default"} Priority" />`;
}

/**
 * Generates the HTML for the assigned contacts of a task.
 * @param {Object} element - The task object containing contacts.
 * @returns {string} The HTML string for the assigned contacts.
 */
function generateContactsHTML(element) {
    if (!element["contacts"]) return "";
    return `
        <div class="task-assigned">
            ${element["contacts"]
                .map(contact => {
                    const initials = getInitials(contact);
                    const color = getColor(contact);
                    return `<span class="person-circle" style="background-color: ${color};">${initials}</span>`;
                })
                .join("")}
        </div>`;
}

/**
 * Handles the drop event when a task card is dropped into a new category.
 * @param {DragEvent} ev - The drag event.
 */
function dropTask(ev) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text");
    const taskElement = document.getElementById(taskId);
    const newCategory = ev.currentTarget.id;

    ev.currentTarget.appendChild(taskElement);
    taskElement.classList.remove("dragging");
    savePosition(taskId, newCategory);

    todos = todos.map(task => 
        task.id == taskId ? { ...task, category: newCategory } : task
    );

    updateBoardCounts();
    updateHTML();
}

/**
 * Updates the counts of tasks in different categories.
 */
function updateBoardCounts() {
    updateTodoCount();
    updateDoneCount();
    updateInProgressCount();
    updateAwaitFeedbackCount();
}

// Removes the 'dragging' class from a task when dragging ends
document.addEventListener("dragend", function (event) {
    event.target.classList.remove("dragging");
});

/**
 * Updates the HTML content of the board by updating each category.
 */
function updateHTML() {
    updateCategory("todo", "To do");
    updateCategory("inProgress", "In progress");
    updateCategory("awaitFeedback", "Await feedback");
    updateCategory("done", "Done");
}

/**
 * Updates the tasks displayed in a specific category.
 * @param {string} category - The category ID (e.g., 'todo', 'inProgress').
 * @param {string} label - The label to display if there are no tasks.
 */
function updateCategory(category, label) {
    const tasks = todos.filter(task => task.category === category);
    const container = document.getElementById(category);
    if (tasks.length === 0) {
        container.innerHTML = `<div class="no-tasks">No tasks ${label}</div>`;
    } else {
        container.innerHTML = tasks.map(task => {
            const taskHTML = generateTodoHTML(task);
            updateProgressBar(task.id);
            return taskHTML;
        }).join("");

        // Add event listeners to the task elements
        const taskElements = container.querySelectorAll('.titel-card');
        taskElements.forEach(taskElement => {
            taskElement.addEventListener('dragstart', dragTask);
            taskElement.addEventListener('touchstart', dragTask, { passive: false });
        });
    }
}
