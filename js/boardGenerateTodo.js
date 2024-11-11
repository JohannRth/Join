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
            updateProgressBar(task.id); // Fortschrittsbalken aktualisieren
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
            updateProgressBar(task.id); // Fortschrittsbalken aktualisieren
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
            updateProgressBar(task.id); // Fortschrittsbalken aktualisieren
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
            updateProgressBar(task.id); // Fortschrittsbalken aktualisieren
        });
    }
}