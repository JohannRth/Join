/**
 * Displays the subtasks in the edit overlay.
 * @param {Array<Object>} subtasks - An array of subtask objects.
 * @param {string} taskId - The unique identifier of the task.
 */
function displaySubtasks(subtasks, taskId) {
    const container = document.getElementById("subTaskListEdit");
    container.innerHTML = "";

    if (!subtasks?.length) {
        console.warn("No subtasks for task:", taskId);
        return;
    }

    subtasks.forEach((subtask, index) => 
        container.innerHTML += generateSubtaskHTML(subtask, index, taskId)
    );
}

/**
 * Generates HTML for a subtask item in the edit overlay.
 * @param {Object} subtask - The subtask object.
 * @param {number} index - The index of the subtask.
 * @param {string} taskId - The unique identifier of the task.
 * @returns {string} HTML string representing the subtask.
 */
function generateSubtaskHTML(subtask, index, taskId) {
    if (!subtask || index === undefined || !taskId) {
        console.error("Invalid parameters for generateSubtaskHTML:", subtask, index, taskId);
        return "";
    }
    const title = subtask.title || "Untitled";
    return `
        <div class="subTask" data-index="${index}">
            <div class="leftContainerSubTask">
                <span class="subTaskText" id="subTaskText-${index}">${title}</span>
            </div>
            <div class="rightContainerSubTask">
                <img onclick="editSubTaskEdit(${index}, '${taskId}')" src="./assets/img/edit.svg" alt="Edit">
                <img src="./assets/img/delete.svg" alt="Delete" onclick="deleteSubtaskEdit(${index}, '${taskId}')">
            </div>
        </div>`;
}

function showInputSubTasksEdit() {
    const inputContainer = document.getElementById("inputSubTaksClickContainerEdit");
    const addButton = document.getElementById("addSubTaskButtonEdit"); // Das Plus-Icon

    if (inputContainer.classList.contains("visible")) {
        // Verberge das X- und Check-Container, zeige das Plus-Icon
        inputContainer.classList.remove("visible");
        addButton.style.display = "block"; // Zeige das Plus-Icon
    } else {
        // Zeige das X- und Check-Container, verberge das Plus-Icon
        inputContainer.classList.add("visible");
        addButton.style.display = "none"; // Verstecke das Plus-Icon
    }
}

/**
 * Adds a new subtask to the task being edited.
 * @async
 */
async function addNewSubtaskEdit() {
    const input = document.getElementById('subTaskInputEdit');
    const value = input.value.trim();
    if (!value) return;

    const taskId = document.getElementById("edit-overlay").dataset.taskId;

    try {
        const subtasks = (await loadData(`tasks/${taskId}`)).subtasks || {};
        await updateData(`tasks/${taskId}/subtasks/${Object.keys(subtasks).length}`, value);

        input.value = '';
        await reloadSubtasks(taskId);
    } catch (error) {
        console.error("Error adding subtask:", error);
    }
}

/**
 * Deletes a subtask from the task being edited.
 * @async
 * @param {number} index - The index of the subtask to delete.
 */
async function deleteSubtaskEdit(index) {
    const taskId = document.getElementById("edit-overlay").getAttribute("data-task-id");
    try {
        await Promise.all([
            deleteData(`tasks/${taskId}/subtasks/${index}`),
            deleteData(`subtaskStatus/${taskId}/${index}`)
        ]);
        const taskData = await loadData(`tasks/${taskId}`);
        const subtasks = reorderSubtasks(taskData.subtasks, index);
        await updateData(`tasks/${taskId}/subtasks`, subtasks);

        const statuses = reorderStatuses(taskData.subtaskStatus || {}, index);
        await updateReorderedStatuses(taskId, statuses);
        await reloadSubtasks(taskId);
    } catch (error) {
        console.error("Error deleting subtask:", error);
    }
}

/**
 * Reorders subtasks after a deletion to maintain continuous indices.
 * @param {Object} subtasks - The current subtasks as an object with indices as keys.
 * @param {number} index - The index of the subtask that was deleted.
 * @returns {Object} The reordered subtasks object.
 */
function reorderSubtasks(subtasks, index) {
    const updated = subtasks ? Object.values(subtasks).filter((_, i) => i !== index) : [];
    return Object.fromEntries(updated.map((subtask, i) => [i, subtask]));
}

/**
 * Reorders subtask statuses after a deletion to maintain continuous indices.
 * @param {Object} statuses - The current statuses as an object with indices as keys.
 * @param {number} index - The index of the status that was deleted.
 * @returns {Object} The reordered statuses object.
 */
function reorderStatuses(statuses, index) {
    return Object.fromEntries(Object.entries(statuses)
        .map(([key, value]) => [parseInt(key, 10), value])
        .filter(([i]) => i !== index)
        .map(([i, value], newIndex) => [i > index ? newIndex - 1 : newIndex, value]));
}

/**
 * Updates the reordered subtask statuses in Firebase.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 * @param {Object} statuses - The reordered statuses object.
 */
async function updateReorderedStatuses(taskId, statuses) {
    await Promise.all(Object.entries(statuses).map(([key, value]) =>
        updateData(`subtaskStatus/${taskId}/${key}`, value)
    ));
    const lastKey = Object.keys(statuses).length;
    await deleteData(`subtaskStatus/${taskId}/${lastKey}`);
}

/**
 * Lädt die Subtasks neu und aktualisiert die Edit-Karte.
 * @param {string} taskId - Die ID der Aufgabe.
 */
async function reloadSubtasks(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        const subtasks = taskData?.subtasks ? Object.values(taskData.subtasks) : [];

        // Render die aktualisierte Subtask-Liste
        renderSubtaskEdit(subtasks, taskId);
    } catch (error) {
        console.error("Error reloading subtasks:", error);
    }
}


/**
 * Rendert die Subtasks in der Edit-Karte.
 * @param {Array<string>} subtasks - Die aktualisierte Liste der Subtasks.
 * @param {string} taskId - Die ID der Aufgabe.
 */
function renderSubtaskEdit(subtasks, taskId) {
    const container = document.getElementById("subTaskListEdit");
    container.innerHTML = "";

    subtasks.forEach((subtask, index) => {
        container.innerHTML += `
            <div class="subTask" data-index="${index}">
                <div class="leftContainerSubTask">
                    <span class="subTaskText" id="subTaskText-${index}">${subtask}</span>
                </div>
                <div class="rightContainerSubTask">
                    <img onclick="editSubTaskEdit(${index}, '${taskId}')" src="./assets/img/edit.svg" alt="Edit">
                    <img onclick="deleteSubtaskEdit(${index}, '${taskId}')" src="./assets/img/delete.svg" alt="Delete">
                </div>
            </div>
        `;
    });
}

/**
 * Aktiviert den Bearbeitungsmodus für einen Subtask.
 * @param {number} index - Der Index des Subtasks.
 * @param {string} taskId - Die ID des Tasks, zu dem der Subtask gehört.
 */
async function editSubTaskEdit(index, taskId) {
    const subTaskElement = document.querySelector(`[data-index="${index}"]`);
    const subTaskText = document.getElementById(`subTaskText-${index}`);
    const currentTitle = subTaskText.textContent;
        subTaskElement.innerHTML = `
        <div class="subTaskEditContainer">
            <input type="text" id="editInput-${index}" value="${currentTitle}" onkeypress="handleEnterKeyEditSubtask(event, ${index}, '${taskId}')" />
            <div class="subTaskIcons">
                <img onclick="saveSubTaskEdit(${index}, '${taskId}')" src="./assets/img/Property 1=check.svg" alt="Save" class="icon">
                <img onclick="cancelEditSubTask(${index}, '${currentTitle}', '${taskId}')" src="./assets/img/close.svg" alt="Cancel" class="icon">
            </div>
        </div>
    `;
}

/**
 * Handhabt die Enter-Taste, um Änderungen zu speichern.
 * @param {Event} event - Das Keypress-Event.
 * @param {number} index - Der Index des Subtasks.
 * @param {string} taskId - Die ID der Aufgabe.
 */
function handleEnterKeyEditSubtask(event, index, taskId) {
    if (event.key === "Enter") {
        event.preventDefault(); // Verhindert den Standard-Submit (falls innerhalb eines Formulars)
        saveSubTaskEdit(index, taskId);
    }
}

/**
 * Speichert die Änderungen an einem Subtask und aktualisiert die Edit-Karte.
 * @param {number} index - Der Index des Subtasks.
 * @param {string} taskId - Die ID der Aufgabe.
 */
async function saveSubTaskEdit(index, taskId) {
    const input = document.getElementById(`editInput-${index}`);
    const newValue = input?.value.trim();
    if (!newValue) {
        alert("Subtask title cannot be empty!");
        return;
    }
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        const subtasks = taskData?.subtasks || {};
        subtasks[index] = newValue;

        await updateData(`tasks/${taskId}/subtasks`, subtasks);
        await reloadSubtasks(taskId);
    } catch{}
}

/**
 * Bricht den Bearbeitungsmodus ab und stellt das ursprüngliche Layout wieder her.
 * @param {number} index - Der Index des Subtasks.
 * @param {string} originalTitle - Der ursprüngliche Titel des Subtasks.
 * @param {string} taskId - Die ID der Aufgabe, zu der der Subtask gehört.
 */
function cancelEditSubTask(index, originalTitle, taskId) {
    const subTaskElement = document.querySelector(`[data-index="${index}"]`); // Den gesamten Subtask-Container finden
    
    if (!subTaskElement) {
        console.error(`Subtask element with index ${index} not found.`);
        return;
    }
    subTaskElement.innerHTML = `
        <div class="leftContainerSubTask">
            <span class="subTaskText" id="subTaskText-${index}">${originalTitle}</span>
        </div>
        <div class="rightContainerSubTask">
            <img onclick="editSubTaskEdit(${index}, '${taskId}')" src="./assets/img/edit.svg" alt="Edit">
            <img onclick="deleteSubtaskEdit(${index}, '${taskId}')" src="./assets/img/delete.svg" alt="Delete">
        </div>
    `;
}

/**
 * Validates the structure of the subtasks object.
 * Ensures all subtasks are strings, not objects.
 * @param {Object} subtasks - The subtasks object to validate.
 * @returns {boolean} - Returns true if the structure is valid, otherwise false.
 */
function validateSubtaskStructure(subtasks) {
    return Object.values(subtasks).every(value => typeof value === "string");
}
