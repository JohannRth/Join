/**
 * Opens the edit overlay for a specific task, loading its details and preparing the UI.
 * @async
 * @param {string} taskId - The unique identifier of the task to edit.
 */
async function openEditOverlay(taskId) {
    await loadTaskDetails(taskId);
    await populateContactDropdownFromFirebase();
    await loadAssignedContacts(taskId);
    
    document.querySelector(".btn-check-edit").setAttribute("onclick", `confirmChanges('${taskId}')`);

    const editOverlay = document.getElementById("edit-overlay");
    editOverlay.setAttribute("data-task-id", taskId);
    editOverlay.classList.remove("hidden");
    document.body.classList.add("no-scroll");
}

/**
 * Loads the task title from Firebase and populates the title input field.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 */
async function loadTaskTitle(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);

        if (taskData && taskData.title) {
            document.getElementById("edit-title-edit").value = taskData.title;
        } else {
            console.error("Title not found for task:", taskId);
        }
    } catch (error) {
        console.error("Error loading task title:", error);
    }
}

/**
 * Loads detailed information of a task and populates the edit form fields.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 */
async function loadTaskDetails(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        if (!taskData) return;

        const { title, description, dueDate, prio, subtasks, newSubtask } = taskData;
        if (title) document.getElementById("edit-title-edit").value = title;
        if (description) document.getElementById("edit-description").value = description;
        if (dueDate) document.getElementById("edit-due-date").value = dueDate;
        if (prio) setPriorityEdit(prio);

        const getSubtasks = (data) => data ? Object.values(data).map(title => ({ title })) : [];
        displaySubtasks([...getSubtasks(subtasks), ...getSubtasks(newSubtask)], taskId);
     } catch (error) {
        console.error("Error loading task details:", error);
     }
}

/**
 * Highlights the priority button corresponding to the given priority level.
 * @param {string} priority - The priority level ('urgent', 'medium', or 'low').
 */
function highlightPriorityButton(priority) {
    const buttons = {
        urgent: document.querySelector(".prioButtonUrgentEdit"),
        medium: document.querySelector(".prioButtonMediumEdit"),
        low: document.querySelector(".prioButtonLowEdit")
    };

    Object.values(buttons).forEach(button => button.classList.remove("active"));
    if (buttons[priority]) buttons[priority].classList.add("active");
}

/** @type {string} */
let currentPriority = ""; 

/**
 * Sets the priority in the edit form and updates the UI accordingly.
 * @param {string} priority - The priority level ('urgent', 'medium', or 'low').
 */
function setPriorityEdit(priority) {
    const buttons = {
        urgent: document.querySelector(".prioButtonUrgentEdit"),
        medium: document.querySelector(".prioButtonMediumEdit"),
        low: document.querySelector(".prioButtonLowEdit")
    };

    Object.values(buttons).forEach(button => button.classList.remove("active"));
    if (buttons[priority]) {
        buttons[priority].classList.add("active");
        currentPriority = priority;
    }
}

/**
 * Displays the assigned contacts in the edit overlay.
 * @param {Array<string>} contacts - An array of contact names.
 */
function displayAssignedContacts(contacts) {
    const container = document.getElementById("aktivContactsEdit");
    container.innerHTML = "";

    contacts.forEach(contact => {
        const contactElement = document.createElement("div");
        contactElement.classList.add("contactBubble");
        contactElement.style.backgroundColor = getRandomColor();
        contactElement.textContent = getInitials(contact);
        container.appendChild(contactElement);
    });
}

/**
 * Retrieves the initials from a contact's full name.
 * @param {string} name - The full name of the contact.
 * @returns {string} The initials of the contact.
 */
function getInitials(name) {
    const nameParts = name.split(" ");
    return nameParts.length >= 2 
        ? nameParts[0][0] + nameParts[1][0]
        : nameParts[0][0];
}

/**
 * Generates a random color from a predefined list.
 * @returns {string} A random color in hexadecimal format.
 */
function getRandomColor() {
    const colors = ["#FF5733", "#33C3FF", "#7D3CFF", "#FFC300", "#DAF7A6"];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Loads the assigned contacts for a task and displays them.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 */
async function loadAssignedContacts(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        const assignedContacts = taskData?.assignedTo || [];
        displayAssignedContacts(assignedContacts);
    } catch (error) {
        console.error("Error loading assigned contacts:", error);
    }
}

/**
 * Displays the assigned contacts in the edit overlay, allowing removal on click.
 * @param {Array<string>} contacts - An array of contact names.
 */
function displayAssignedContacts(contacts) {
    const container = document.getElementById("aktivContactsEdit");
    container.innerHTML = "";

    contacts.forEach(contact => {
        const contactElement = document.createElement("div");
        contactElement.classList.add("contactBubble");
        contactElement.style.backgroundColor = getColor(contact);
        contactElement.textContent = getInitials(contact);
        contactElement.setAttribute("data-name", contact);

        contactElement.addEventListener("click", () => container.removeChild(contactElement));
        container.appendChild(contactElement);
    });
}

/**
 * Loads contacts from Firebase.
 * @async
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of contact objects.
 */
async function loadContacts() {
    try {
        const contactsData = await loadData("contacts"); 
        return contactsData ? Object.values(contactsData) : []; 
    } catch (error) {
        console.error("Error loading contacts:", error);
        return [];
    }
}

/**
 * Populates the contact dropdown in the edit overlay with contacts from Firebase.
 * @async
 */
async function populateContactDropdownFromFirebase() {
    const contacts = await loadContacts();
    const dropdown = document.getElementById("contactDropdownEdit");
    if (!contacts?.length) {
        dropdown.innerHTML = "";
        return;
    }

    dropdown.innerHTML = contacts.map(createContactHTML).join("");

    dropdown.querySelectorAll(".contactDropdownItem").forEach((item, i) =>
        item.addEventListener("click", () => {
            const name = contacts[i].name || contacts[i];
            addContactToAssignedList(name, getInitials(name), getColor(name));
            dropdown.style.display = "none";
        }));
}

/**
 * Creates HTML for a contact to be displayed in the dropdown.
 * @param {Object|string} contact - The contact object or name string.
 * @returns {string} HTML string representing the contact.
 */
function createContactHTML(contact) {
    const name = contact.name || contact;
    return `
        <div class="contactDropdownItem">
            <div class="contactBubble" style="background-color: ${getColor(name)};">
                ${getInitials(name)}
            </div>
            <span class="contactName">${name}</span>
        </div>`;
}

// Event listener to toggle the contact dropdown visibility
document.getElementById("contactsEdit").addEventListener("click", () => {
    const dropdown = document.getElementById("contactDropdownEdit");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Event listener to close the contact dropdown when clicking outside
document.addEventListener("click", (event) => {
    const dropdown = document.getElementById("contactDropdownEdit");
    const target = event.target;
    if (!dropdown.contains(target) && target.id !== "contactsEdit") {
        dropdown.style.display = "none";
    }
});

/**
 * Adds a contact to the assigned contacts list in the edit overlay.
 * @param {string} name - The contact's name.
 * @param {string} initials - The contact's initials.
 * @param {string} color - The color associated with the contact.
 */
function addContactToAssignedList(name, initials, color) {
    const assignedContainer = document.getElementById("aktivContactsEdit");
    const isAlreadyAssigned = Array.from(assignedContainer.children).some(
        el => el.getAttribute("data-name") === name
    );
    if (isAlreadyAssigned) return; 

    const contactBubble = document.createElement("div");
    contactBubble.classList.add("contactBubble");
    contactBubble.style.backgroundColor = color;
    contactBubble.textContent = initials;
    contactBubble.setAttribute("data-name", name); 
    contactBubble.addEventListener("click", () => {
        assignedContainer.removeChild(contactBubble);
    });
    assignedContainer.appendChild(contactBubble);
}

/**
 * Displays the assigned contacts in the edit overlay.
 * @param {Array<string>} contacts - An array of contact names.
 */
function displayAssignedContacts(contacts) {
    const container = document.getElementById("aktivContactsEdit");
    container.innerHTML = "";

    contacts.forEach(contact => {
        const element = Object.assign(document.createElement("div"), {
            className: "contactBubble",
            textContent: getInitials(contact),
            style: `background-color: ${getColor(contact)}`,
        });
        element.setAttribute("data-name", contact);
        element.addEventListener("click", () => container.removeChild(element));
        container.appendChild(element);
    });
}

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
    const title = subtask?.title || "Untitled";
    return `
        <div class="subTask" data-index="${index}">
            <div class="leftContainerSubTask">
                <span class="subTaskText">${title}</span>
            </div>
            <div class="rightContainerSubTask">
                <img src="./assets/img/delete.svg" alt="Delete" onclick="deleteSubtaskEdit(${index}, '${taskId}')">
            </div>
        </div>`;
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
 * Reloads the subtasks for a task and updates the UI.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 */
async function reloadSubtasks(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        const subtasks = taskData.subtasks ? Object.values(taskData.subtasks) : [];
        
        renderSubtaskEdit(subtasks);  // Update the subtask list with the new data
    } catch (error) {
        console.error("Error loading subtasks:", error);
    }
}

/**
 * Renders the subtasks in the edit overlay.
 * @param {Array<string>} subtasks - An array of subtask titles.
 */
function renderSubtaskEdit(subtasks) {
    const container = document.getElementById("subTaskListEdit");
    container.innerHTML = "";

    subtasks.forEach((subtask, index) => {
        container.innerHTML += `
            <div class="subTask" data-index="${index}">
                <div class="leftContainerSubTask">${subtask}</div>
                <div class="rightContainerSubTask">
                    <img src="./assets/img/delete.svg" alt="Delete" onclick="deleteSubtaskEdit(${index})">
                </div>
            </div>`;
    });
}

/**
 * Reloads task data and updates the UI, including overlays.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 */
async function reloadTaskDataAndUpdateUI(taskId) {
    try {
        await Promise.all([
            loadTodosFromFirebase(),
            loadPositionsFromFirebase(),
            loadSubtaskStatusesFromFirebase()
        ]);
        updateHTML();
        const editOverlay = document.getElementById("edit-overlay");
        if (editOverlay && !editOverlay.classList.contains("hidden")) await loadTaskDetails(taskId);
        const cardOverlay = document.getElementById("card-overlay");
        if (cardOverlay && !cardOverlay.classList.contains("hidden")) {
            const task = todos.find(t => t.id === taskId);
            if (task) cardOverlay.innerHTML = generateExpandedCardHTML(task);
        }
    } catch (error) {
        console.error("Error reloading task data and updating UI:", error);
    }
}

/**
 * Closes the edit overlay and re-enables body scrolling.
 */
function closeEditOverlay() {
    const editOverlay = document.getElementById("edit-overlay");
    editOverlay.classList.add("hidden");

    document.body.classList.remove("no-scroll");
}

// Event listener to close the edit overlay when clicking outside
document.getElementById("edit-overlay").addEventListener("click", function (event) {
    if (event.target === this) {
        closeEditOverlay();
    }
});

/**
 * Confirms changes made in the edit overlay and updates the task.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 */
async function confirmChanges(taskId) {
    try {
        const updatedData = await getUpdatedTaskData(taskId);
        if (!updatedData) return;

        await updateData(`tasks/${taskId}`, updatedData);
        deletedSubtasks = [];
        closeEditOverlay();
        await reloadTaskDataAndUpdateUI(taskId);
        updateHTML();

        const cardOverlay = document.getElementById("card-overlay");
        if (cardOverlay && !cardOverlay.classList.contains("hidden")) openCardOverlay(taskId);
    } catch (error) {
        console.error("Error confirming changes:", error);
    }
}

/**
 * Gathers updated task data from the edit overlay form.
 * @async
 * @param {string} taskId - The unique identifier of the task.
 * @returns {Promise<Object|null>} The updated task data, or null if not found.
 */
async function getUpdatedTaskData(taskId) {
    const existingData = await loadData(`tasks/${taskId}`);
    if (!existingData) return null;

    const title = document.getElementById("edit-title-edit").value.trim();
    const description = document.getElementById("edit-description").value.trim();
    const dueDate = document.getElementById("edit-due-date").value;
    const priority = currentPriority;

    const assignedContacts = Array.from(document.getElementById("aktivContactsEdit").children)
        .map(contact => contact.getAttribute("data-name"));

    return { ...existingData, title, description, dueDate, prio: priority, assignedTo: assignedContacts };
}

// Initialize flatpickr date picker for the due date input
flatpickr("#edit-due-date", {
    dateFormat: "Y-m-d", // Format matching the input field
    onChange: function(selectedDates, dateStr, instance) {
        // Updates the input field with the selected date
        document.getElementById("edit-due-date").value = dateStr;
    }
});