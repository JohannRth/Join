/**
 * Generates the HTML for an expanded task card overlay.
 * @param {Object} element - The task object containing all task details.
 * @returns {string} The HTML string for the expanded task card.
 */
function generateExpandedCardHTML(element) {
    const taskTypeStyle = getTaskTypeStyle(element.type);
    const priority = getPriorityData(element.priority);
    const dueDate = element.dueDate ? new Date(element.dueDate).toLocaleDateString("de-DE") : "Kein Datum";
    const subtasksHTML = generateSubtasksHTML(element);
    const assignedContactsHTML = generateAssignedContactsHTML(element);

    return generateExpandedCardHTMLTemplate(element, taskTypeStyle, priority, dueDate, subtasksHTML, assignedContactsHTML);
}

/**
 * Generates the HTML template for the expanded task card overlay.
 * @param {Object} element - The task object.
 * @param {string} taskTypeStyle - The inline style for the task type.
 * @param {Object} priority - An object containing label and icon for priority.
 * @param {string} dueDate - The formatted due date string.
 * @param {string} subtasksHTML - The HTML string for subtasks.
 * @param {string} assignedContactsHTML - The HTML string for assigned contacts.
 * @returns {string} The complete HTML template for the expanded task card.
 */
function generateExpandedCardHTMLTemplate(element, taskTypeStyle, priority, dueDate, subtasksHTML, assignedContactsHTML) {
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
                <span class="priority-focus-overlay">${priority.label}</span>
                <img src="${priority.icon}" alt="Priority ${priority.label}" class="priority-img-overlay">
            </div>    
        </div>
        <span class="task-assigned-line-overlay">Assigned To:</span>
        <div class="task-assigned-container-overlay">
            ${assignedContactsHTML}
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
            <p class="action-btn-overlay" onclick="openEditOverlay('${element.id}')">
                <img src="./assets/img/edit.svg" alt="edit">Edit
            </p>
        </div>
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
        ? "height: 36px; width: 208px; border-radius: 8px; padding: 4px 16px; background-color: #1FD7C1; color: #FFFFFF; font-size: 23px; font-weight: 400;"
        : "width: 164px; height: 36px; border-radius: 8px; padding: 4px 16px; background-color: #0038ff; color: white; font-weight: 400; font-size: 23px; display: flex; align-items: center; justify-content: center;";
}

/**
 * Retrieves priority data including label and icon based on priority level.
 * @param {string} priority - The priority level ('urgent', 'medium', 'low').
 * @returns {Object} An object containing the label and icon URL.
 */
function getPriorityData(priority) {
    const priorities = {
        urgent: { label: "Urgent", icon: "./assets/img/urgent-titel-card.svg" },
        medium: { label: "Medium", icon: "./assets/img/medium-titel-card.svg" },
        low: { label: "Low", icon: "./assets/img/low-titel-card.svg" },
    };
    return priorities[priority] || { label: "Default", icon: "./assets/img/default-titel-card.svg" };
}

/**
 * Generates the HTML for the subtasks section of the expanded card.
 * @param {Object} element - The task object containing subtasks.
 * @returns {string} The HTML string for the subtasks.
 */
function generateSubtasksHTML(element) {
    return element.subtasks.map((subtask, index) => `
        <div class="subtask-item" style="display: flex; align-items: center; gap: 16px;">
            <input type="checkbox" 
                   id="subtask-checkbox-${element.id}-${index}" 
                   onclick="toggleSubtask('${element.id}', ${index})" 
                   class="styled-checkbox"
                   ${subtask.completed ? "checked" : ""}>
            <label for="subtask-checkbox-${element.id}-${index}">${subtask.title}</label>
        </div>
    `).join('');
}

/**
 * Generates the HTML for the assigned contacts section.
 * @param {Object} element - The task object containing contacts.
 * @returns {string} The HTML string for the assigned contacts.
 */
function generateAssignedContactsHTML(element) {
    return element.contacts.map(contact => `
        <div class="person-container-overlay">
            <span class="person-circle-overlay" style="background-color: ${getColor(contact)};">${getInitials(contact)}</span>
            <span class="person-name-overlay">${contact}</span>
        </div>
    `).join('');
}

/**
 * Toggles the completion status of a subtask and updates the UI and data.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 * @param {number} subtaskIndex - The index of the subtask in the task's subtask array.
 */
async function toggleSubtask(taskId, subtaskIndex) {
    const task = todos.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
        console.error("Subtask not found or invalid index:", taskId, subtaskIndex);
        return;
    }
    const subtask = task.subtasks[subtaskIndex];
    subtask.completed = !subtask.completed;

    await saveSubtaskStatus(taskId, subtaskIndex, subtask.completed);
    task.completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const totalSubtasks = task.subtasks.length;
    const percentage = totalSubtasks > 0 ? (task.completedSubtasks / totalSubtasks) * 100 : 0;
    updateProgressBar(taskId, percentage, task.completedSubtasks, totalSubtasks);
}

/**
 * Saves the completion status of a subtask to Firebase.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {boolean} isChecked - The completion status of the subtask.
 */
async function saveSubtaskStatus(taskId, subtaskIndex, isChecked) {
    const path = `subtaskStatus/${taskId}/${subtaskIndex}`;
    console.log(`Saving subtask status at path ${path}:`, isChecked);
    await updateData(path, { completed: isChecked });
}

/**
 * Loads subtask completion statuses from Firebase and updates the local tasks.
 * @async
 */
async function loadSubtaskStatusesFromFirebase() {
    const subtaskStatuses = await loadData("subtaskStatus");

    todos.forEach(task => {
        if (subtaskStatuses[task.id]) {
            task.subtasks.forEach((subtask, index) => {
                if (subtaskStatuses[task.id][index] && subtaskStatuses[task.id][index].completed !== undefined) {
                    subtask.completed = subtaskStatuses[task.id][index].completed || false;
                } else {
                    subtask.completed = false; 
                }
            });
        }
    });
}

/**
 * Updates the progress bar of a task based on completed subtasks.
 * @param {string} taskId - The unique identifier of the task.
 */
function updateProgressBar(taskId) {
    const task = todos.find((t) => t.id === taskId);
    if (!task) return;
    const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
    const totalSubtasks = task.subtasks.length;
    const percentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const taskElement = document.getElementById(taskId);
    if (!taskElement) return;

    const progressBar = taskElement.querySelector(".progress-fill");
    const progressText = taskElement.querySelector(".progress-text");

    if (progressBar && progressText) {
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
    }
}

/**
 * Opens the overlay displaying the expanded view of a task card.
 * @param {string} taskId - The unique identifier of the task.
 */
function openCardOverlay(taskId) {
    const overlay = document.getElementById("card-overlay");
    const task = todos.find((t) => t.id === taskId); 
    overlay.innerHTML = generateExpandedCardHTML(task);
    overlay.classList.remove("hidden");

    document.body.classList.add("no-scroll");
    const deleteButton = overlay.querySelector(".action-btn-overlay");
    deleteButton.setAttribute("onclick", `deleteTask('${taskId}')`);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            closeCardOverlay();
        }
    });
}

/**
 * Closes the task card overlay and re-enables body scrolling.
 */
function closeCardOverlay() {
    const overlay = document.getElementById("card-overlay");
    overlay.classList.add("hidden");

    document.body.classList.remove("no-scroll");
}

/**
 * Deletes a task and its associated data from Firebase and updates the UI.
 * @async
 * @param {string} taskId - The unique identifier of the task to delete.
 */
async function deleteTask(taskId) {
    todos = todos.filter(task => task.id !== taskId);
    try {
        await Promise.all([
            deleteData(`tasks/${taskId}`),
            deleteData(`subtaskStatus/${taskId}`),
            deleteData(`positionDropArea/${taskId}`)
        ]);
    } catch (error) {
        console.error("Error deleting task:", error);
        return; 
    }
    updateHTML();
    closeCardOverlay();
}

/**
 * Deletes data from Firebase at the specified path.
 * @async
 * @param {string} path - The Firebase path from which to delete data.
 */
async function deleteData(path) {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Error deleting data from Firebase: ${response.statusText}`);
        }
        console.log(`Data at path ${path} was successfully deleted.`);
    } catch (error) {
        console.error("Error deleting data from Firebase:", error);
    }
}
