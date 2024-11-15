function generateTodoHTML(element) {
    const taskTypeStyle = getTaskTypeStyle(element.type);
    const progressHTML = generateProgressHTML(element);
    const priorityIcon = getPriorityIcon(element.priority);
    const contactsHTML = generateContactsHTML(element);

    return generateTodoHTMLTemplate(element, taskTypeStyle, progressHTML, priorityIcon, contactsHTML);
}

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

function getTaskTypeStyle(type) {
    return type === "Technical Task"
        ? "height: 27px; width: 144px; border-radius: 8px; padding: 4px 16px; background-color: #1FD7C1; color: #FFFFFF; font-size: 16px; font-weight: 400;"
        : "width: 113px; height: 27px; border-radius: 8px; padding: 4px 16px; background-color: #0038ff; color: white; font-weight: 400; font-size: 16px; display: flex; align-items: center; justify-content: center;";
}

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

function getPriorityIcon(priority) {
    const icons = {
        urgent: "./assets/img/urgent-titel-card.svg",
        medium: "./assets/img/medium-titel-card.svg",
        low: "./assets/img/low-titel-card.svg",
        default: "./assets/img/default-titel-card.svg",
    };
    return `<img src="${icons[priority] || icons.default}" alt="${priority || "Default"} Priority" />`;
}

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

function updateBoardCounts() {
    updateTodoCount();
    updateDoneCount();
    updateInProgressCount();
    updateAwaitFeedbackCount();
}

document.addEventListener("dragend", function (event) {
    event.target.classList.remove("dragging");
});

function updateHTML() {
    updateCategory("todo", "To do");
    updateCategory("inProgress", "In progress");
    updateCategory("awaitFeedback", "Await feedback");
    updateCategory("done", "Done");
}

function updateCategory(category, label) {
    const tasks = todos.filter(task => task.category === category);
    const container = document.getElementById(category);
    container.innerHTML = tasks.length === 0
        ? `<div class="no-tasks">No tasks ${label}</div>`
        : tasks.map(task => {
            const taskHTML = generateTodoHTML(task);
            updateProgressBar(task.id);
            return taskHTML;
        }).join("");
}