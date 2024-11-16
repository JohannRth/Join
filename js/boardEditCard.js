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
    const assignedContacts = Array.from(document.getElementById("aktivContactsEdit").children)
        .map(contact => contact.getAttribute("data-name")); // Bereits zugewiesene Kontakte

    if (!contacts?.length) {
        dropdown.innerHTML = "";
        return;
    }

    // Erstelle die HTML-Struktur für jeden Kontakt mit Checkbox
    dropdown.innerHTML = contacts.map(contact => createContactHTML(contact, assignedContacts)).join("");
    
    // Entferne das automatische Öffnen hier
}

/**
 * Creates HTML for a contact to be displayed in the dropdown.
 * @param {Object|string} contact - The contact object or name string.
 * @returns {string} HTML string representing the contact.
 */
function createContactHTML(contact, assignedContacts) {
    const name = contact.name || contact;
    const isChecked = assignedContacts.includes(name); // Überprüfe, ob Kontakt bereits zugewiesen ist

    return `
        <div class="contactDropdownItem" data-name="${name}">
            <div class="contactBubble" style="background-color: ${getColor(name)};">
                ${getInitials(name)}
            </div>
            <span class="contactName">${name}</span>
            <input 
                type="checkbox" 
                class="contactCheckbox" 
                ${isChecked ? "checked" : ""} 
                onclick="toggleAssignedContact('${name}')">
        </div>
    `;
}

// Event listener to toggle the contact dropdown visibility
document.getElementById("contactsEdit").addEventListener("click", () => {
    const dropdown = document.getElementById("contactDropdownEdit");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Event-Listener, um das Dropdown zu schließen, wenn man außerhalb klickt
document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("contactDropdownEdit");
    const input = document.getElementById("contactsInputEdit");

    // Prüfe, ob der Klick außerhalb von Input und Dropdown war
    if (!dropdown.contains(event.target) && event.target !== input) {
        dropdown.classList.add("hidden");
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
    dateFormat: "Y-m-d", // Format für das Eingabefeld
    minDate: "today", // Verhindert die Auswahl von Daten vor dem heutigen Datum
    onChange: function(selectedDates, dateStr, instance) {
        // Aktualisiert das Eingabefeld mit dem ausgewählten Datum
        document.getElementById("edit-due-date").value = dateStr;
    }
});
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

function handleEnterKey(event) {
    // Prüfen, ob die Enter-Taste gedrückt wurde
    if (event.key === "Enter") {
        // Verhindert, dass das Formular abgeschickt wird (falls innerhalb eines <form>)
        event.preventDefault();

        // Ruf die Funktion auf, die das neue Subtask hinzufügt
        addNewSubtaskEdit(event);

        // Zurücksetzen des Input-Felds
        resetInputField();
    }
}

function handleInputChange() {
    const inputField = document.getElementById("subTaskInputEdit");
    const inputContainer = document.getElementById("inputSubTaksClickContainerEdit");
    const addButton = document.getElementById("addSubTaskButtonEdit");

    if (inputField.value.trim() !== "") {
        // Zeige den Container, wenn das Feld nicht leer ist
        inputContainer.classList.add("visible");
        addButton.style.display = "none";
    } else {
        // Verstecke den Container, wenn das Feld leer ist
        inputContainer.classList.remove("visible");
        addButton.style.display = "block";
    }
}

function addNewSubtaskEdit(event) {
    const inputField = document.getElementById("subTaskInputEdit");
    const subTaskList = document.getElementById("subTaskListEdit");

    // Hole den Wert aus dem Input-Feld
    const newSubtask = inputField.value.trim();

    // Falls das Feld leer ist, abbrechen
    if (!newSubtask) {
        alert("Subtask cannot be empty!");
        return;
    }

    // Neues Subtask als HTML hinzufügen
    const subTaskItem = document.createElement("div");
    subTaskItem.classList.add("subTask");
    subTaskItem.innerHTML = `
        <div class="leftContainerSubTask">${newSubtask}</div>
        <div class="rightContainerSubTask">
            <img onclick="editSubTaskEdit()" src="./assets/img/edit.svg" alt="Edit">
            <img onclick="deleteSubtaskEdit()" src="./assets/img/delete.svg" alt="Delete">
        </div>
    `;

    // Füge es zur Liste hinzu
    subTaskList.appendChild(subTaskItem);

    // Input-Feld zurücksetzen
    resetInputField();
}

function resetInputField() {
    const inputField = document.getElementById("subTaskInputEdit");
    const inputContainer = document.getElementById("inputSubTaksClickContainerEdit");
    const addButton = document.getElementById("addSubTaskButtonEdit");

    inputField.value = ""; // Leere das Input-Feld
    inputContainer.classList.remove("visible"); // Verstecke den Container
    addButton.style.display = "block"; // Zeige das Plus-Icon
}

function toggleAssignedContact(name) {
    const assignedContainer = document.getElementById("aktivContactsEdit");
    const existingContact = Array.from(assignedContainer.children).find(
        el => el.getAttribute("data-name") === name
    );

    if (existingContact) {
        // Kontakt entfernen, wenn bereits zugewiesen
        assignedContainer.removeChild(existingContact);
    } else {
        // Kontakt hinzufügen, wenn nicht zugewiesen
        const contactBubble = document.createElement("div");
        contactBubble.classList.add("contactBubble");
        contactBubble.style.backgroundColor = getColor(name);
        contactBubble.textContent = getInitials(name);
        contactBubble.setAttribute("data-name", name);

        // Klick-Event für Entfernen
        contactBubble.addEventListener("click", () => assignedContainer.removeChild(contactBubble));
        assignedContainer.appendChild(contactBubble);
    }
}