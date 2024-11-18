/**
 * Öffnet den Edit-Overlay-Modus und synchronisiert die Kontakte.
 * @async
 * @param {string} taskId - Die ID der Aufgabe.
 */
async function openEditOverlay(taskId) {
    await loadTaskDetails(taskId); // Task-Details laden
    await loadAssignedContacts(taskId); // Aktive Kontakte laden
    await populateContactDropdownFromFirebaseEdit(); // Dropdown mit Kontakten befüllen

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
 * Fügt einen Kontakt der Liste der aktiven Kontakte hinzu oder entfernt ihn (Edit-Modus).
 * @param {string} name - Name des Kontakts.
 */
function toggleAssignedContactEdit(name, element) {
    const assignedContainer = document.getElementById("aktivContactsEdit");
    const existingContact = Array.from(assignedContainer.children).find(
        el => el.getAttribute("data-name") === name
    );

    if (existingContact) {
        // Kontakt entfernen
        assignedContainer.removeChild(existingContact);
        element.classList.remove("active");
        element.querySelector(".contactCheckbox").checked = false;
    } else {
        // Kontakt hinzufügen
        const contactBubble = document.createElement("div");
        contactBubble.classList.add("contactBubble");
        contactBubble.style.backgroundColor = getColor(name);
        contactBubble.textContent = getInitials(name);
        contactBubble.setAttribute("data-name", name);

        contactBubble.addEventListener("click", () => assignedContainer.removeChild(contactBubble));
        assignedContainer.appendChild(contactBubble);

        element.classList.add("active");
        element.querySelector(".contactCheckbox").checked = true;
    }
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
 * Populiert das Contact-Dropdown im Edit-Modus mit Daten aus Firebase.
 * @async
 */
async function populateContactDropdownFromFirebaseEdit() {
    const contacts = await loadContacts(); // Kontakte aus Firebase laden
    const dropdown = document.getElementById("contactDropdownEdit");

    // Aktive Kontakte abrufen
    const assignedContacts = Array.from(document.getElementById("aktivContactsEdit").children)
        .map(contact => contact.getAttribute("data-name").trim());

    if (!contacts?.length) {
        dropdown.innerHTML = "";
        return;
    }

    // Fülle das Dropdown und markiere aktive Kontakte
    dropdown.innerHTML = contacts.map(contact => createContactHTMLEdit(contact, assignedContacts)).join("");
}

/**
 * Erzeugt HTML für einen Kontakt im Dropdown (Edit-Modus).
 * @param {Object} contact - Kontaktobjekt (enthält `name`).
 * @param {Array<string>} assignedContacts - Bereits zugewiesene Kontakte.
 * @returns {string} HTML-String für den Kontakt.
 */
function createContactHTMLEdit(contact, assignedContacts) {
    const name = contact.name.trim();
    const isChecked = assignedContacts.includes(name); // Überprüfe, ob der Kontakt aktiv ist

    return `
        <div 
            class="contactDropdownItem ${isChecked ? 'active' : ''}" 
            onclick="toggleAssignedContactEdit('${name}', this)">
            <div class="contactBubble" style="background-color: ${getColor(name)};">
                ${getInitials(name)}
            </div>
            <span class="contactName">${name}</span>
            <input 
                type="checkbox" 
                class="contactCheckbox" 
                ${isChecked ? "checked" : ""}
                onclick="event.stopPropagation(); toggleAssignedContactEdit('${name}', this.parentElement);">
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
 * Initialisiert das Dropdown im Edit-Modus und synchronisiert die Checkboxen mit den aktiven Kontakten.
 */
async function initializeContactDropdownEdit() {
    const contacts = await loadContacts(); // Kontakte aus Firebase laden
    const assignedContacts = getAssignedContactsEdit(); // Bereits aktive Kontakte im Edit-Modus

    const dropdown = document.getElementById("contactDropdownEdit");
    dropdown.innerHTML = contacts.map(contact => createContactHTMLEdit(contact, assignedContacts)).join("");
}

// Funktion zum Schließen des Dropdowns
function closeContactsDropdown() {
    const dropdown = document.getElementById("contactDropdownEdit");
    dropdown.style.display = "none"; // Verstecke das Dropdown
}

// Event-Listener für Klicks auf das Dokument
document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("contactDropdownEdit");
    const trigger = document.getElementById("contactsEdit"); // Der Button, der das Dropdown öffnet

    // Überprüfen, ob der Klick außerhalb des Dropdowns und des Triggers liegt
    if (!dropdown.contains(event.target) && event.target !== trigger) {
        closeContactsDropdown();
    }
});


/**
 * Holt aktive Kontakte aus dem "aktivContactsEdit"-Container.
 * @returns {Array<string>} Liste der aktiven Kontaktnamen.
 */
function getAssignedContactsEdit() {
    return Array.from(document.getElementById("aktivContactsEdit").children)
        .map(el => el.getAttribute("data-name").trim().toLowerCase()); // Standardisieren für den Vergleich
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

// Optionen für den Flatpickr-Date-Picker
const flatpickrOptions = {
    dateFormat: "Y-m-d", // Datumsformat
    minDate: "today", // Keine Auswahl von Daten vor dem heutigen Datum
    onChange: handleDateChange, // Callback-Funktion bei Änderung
};

// Initialisierung des Flatpickr-Date-Pickers
flatpickr("#edit-due-date", flatpickrOptions);

/**
 * Callback-Funktion für die Änderung des Datums im Date-Picker.
 * @param {Array<Date>} selectedDates - Die ausgewählten Daten.
 * @param {string} dateStr - Das ausgewählte Datum als String im definierten Format.
 * @param {Object} instance - Die Flatpickr-Instanz.
 */
function handleDateChange(selectedDates, dateStr, instance) {
    const dueDateInput = document.getElementById("edit-due-date");
    if (dueDateInput) {
        dueDateInput.value = dateStr; 
    }
}

function handleEnterKey(event) {
    
    if (event.key === "Enter") {
        event.preventDefault();

        addNewSubtaskEdit(event);

        resetInputField();
    }
}

/**
 * Handhabt die Sichtbarkeit von Elementen basierend auf dem Eingabefeldinhalt.
 */
function handleInputChange() {
    const inputField = document.getElementById("subTaskInputEdit");
    const inputContainer = document.getElementById("inputSubTaksClickContainerEdit");
    const addButton = document.getElementById("addSubTaskButtonEdit");

    if (!inputField || !inputContainer || !addButton) {
        console.warn("Ein oder mehrere DOM-Elemente konnten nicht gefunden werden.");
        return;
    }

    const isInputNotEmpty = inputField.value.trim() !== "";

    toggleVisibility(inputContainer, isInputNotEmpty);
    toggleButtonVisibility(addButton, !isInputNotEmpty);
}

/**
 * Zeigt oder versteckt ein Element basierend auf einem Zustand.
 * @param {HTMLElement} element - Das DOM-Element, dessen Sichtbarkeit geändert werden soll.
 * @param {boolean} isVisible - Gibt an, ob das Element sichtbar sein soll.
 */
function toggleVisibility(element, isVisible) {
    if (isVisible) {
        element.classList.add("visible");
    } else {
        element.classList.remove("visible");
    }
}

/**
 * Zeigt oder versteckt ein Button-Element basierend auf einem Zustand.
 * @param {HTMLElement} button - Der Button, dessen Anzeige geändert werden soll.
 * @param {boolean} isVisible - Gibt an, ob der Button sichtbar sein soll.
 */
function toggleButtonVisibility(button, isVisible) {
    button.style.display = isVisible ? "block" : "none";
}

/**
 * Setzt das Eingabefeld und die zugehörigen UI-Elemente zurück.
 */
function resetInputField() {
    const inputField = document.getElementById("subTaskInputEdit");
    const inputContainer = document.getElementById("inputSubTaksClickContainerEdit");
    const addButton = document.getElementById("addSubTaskButtonEdit");

    if (!inputField || !inputContainer || !addButton) {
        console.warn("Ein oder mehrere DOM-Elemente konnten nicht gefunden werden.");
        return;
    }

    clearInputField(inputField);
    toggleVisibility(inputContainer, false); 
    toggleButtonVisibility(addButton, true);
}

/**
 * Leert den Wert eines Eingabefelds.
 * @param {HTMLInputElement} inputField - Das Eingabefeld, das geleert werden soll.
 */
function clearInputField(inputField) {
    inputField.value = "";
}

/**
 * Zeigt oder versteckt ein Element basierend auf einem Zustand.
 * @param {HTMLElement} element - Das DOM-Element, dessen Sichtbarkeit geändert werden soll.
 * @param {boolean} isVisible - Gibt an, ob das Element sichtbar sein soll.
 */
function toggleVisibility(element, isVisible) {
    if (isVisible) {
        element.classList.add("visible");
    } else {
        element.classList.remove("visible");
    }
}