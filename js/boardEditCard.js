// Funktion zum Öffnen des Edit-Overlays und Laden der aktuellen Task-Daten
async function openEditOverlay(taskId) {
    await loadTaskDetails(taskId);
    await populateContactDropdownFromFirebase();
    await loadAssignedContacts(taskId);

    const editOverlay = document.getElementById("edit-overlay");
    editOverlay.setAttribute("data-task-id", taskId);
    editOverlay.classList.remove("hidden");
    document.body.classList.add("no-scroll");
}

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

async function loadTaskDetails(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        if (taskData) {
            // Setze Titel, Beschreibung und andere Felder
            if (taskData.title) document.getElementById("edit-title-edit").value = taskData.title;
            if (taskData.description) document.getElementById("edit-description").value = taskData.description;
            if (taskData.dueDate) document.getElementById("edit-due-date").value = taskData.dueDate;
            if (taskData.prio) setPriorityEdit(taskData.prio);

            // Lade und zeige Subtasks aus beiden Kategorien
            const subtasksArray = taskData.subtasks ? Object.values(taskData.subtasks).map(title => ({ title })) : [];
            const newSubtasksArray = taskData.newSubtask ? Object.values(taskData.newSubtask).map(title => ({ title })) : [];
            const combinedSubtasks = subtasksArray.concat(newSubtasksArray);

            // Rufe die Funktion auf, um die Subtasks in der Edit-Card anzuzeigen
            displaySubtasks(combinedSubtasks, taskId); // Hier wird die UI der Edit-Card aktualisiert

        } else {
            console.error("Task-Daten nicht gefunden für Task:", taskId);
        }
    } catch (error) {
        console.error("Fehler beim Laden der Task-Details:", error);
    }
}

function highlightPriorityButton(priority) {
    // Select the priority buttons with the updated class names
    const urgentButton = document.querySelector(".prioButtonUrgentEdit");
    const mediumButton = document.querySelector(".prioButtonMediumEdit");
    const lowButton = document.querySelector(".prioButtonLowEdit");

    // Remove 'active' class from all buttons
    urgentButton.classList.remove("active");
    mediumButton.classList.remove("active");
    lowButton.classList.remove("active");

    // Apply 'active' class based on priority
    if (priority === "urgent") {
        urgentButton.classList.add("active"); // Set urgent button active
    } else if (priority === "medium") {
        mediumButton.classList.add("active"); // Set medium button active
    } else if (priority === "low") {
        lowButton.classList.add("active"); // Set low button active
    } else {
        console.warn("Unknown priority level:", priority);
    }

    // Debugging: Log which button should be highlighted
    console.log("Priority:", priority, "Urgent button:", urgentButton, "Medium button:", mediumButton, "Low button:", lowButton);
}

let currentPriority = ""; // To keep track of the selected priority

function setPriorityEdit(priority) {
    // Select the priority buttons
    const urgentButton = document.querySelector(".prioButtonUrgentEdit");
    const mediumButton = document.querySelector(".prioButtonMediumEdit");
    const lowButton = document.querySelector(".prioButtonLowEdit");

    // Remove 'active' class from all buttons
    urgentButton.classList.remove("active");
    mediumButton.classList.remove("active");
    lowButton.classList.remove("active");

    // Apply 'active' class to the selected priority button
    if (priority === "urgent") {
        urgentButton.classList.add("active");
        currentPriority = "urgent";
    } else if (priority === "medium") {
        mediumButton.classList.add("active");
        currentPriority = "medium";
    } else if (priority === "low") {
        lowButton.classList.add("active");
        currentPriority = "low";
    } else {
        console.warn("Unknown priority level:", priority);
    }

    // Debugging: Log the current priority selection
    console.log("Current priority set to:", currentPriority);
}

function displayAssignedContacts(contacts) {
    const assignedToContainer = document.getElementById("aktivContactsEdit");
    assignedToContainer.innerHTML = ""; // Clear existing contacts

    contacts.forEach(contact => {
        const initials = getInitials(contact);
        const color = getRandomColor();

        // Create contact bubble element
        const contactElement = document.createElement("div");
        contactElement.classList.add("contactBubble");
        contactElement.style.backgroundColor = color;
        contactElement.textContent = initials;

        // Append to the container
        assignedToContainer.appendChild(contactElement);
    });
}

// Helper function to get initials from a name
function getInitials(name) {
    const nameParts = name.split(" ");
    return nameParts.length >= 2 
        ? nameParts[0][0] + nameParts[1][0]
        : nameParts[0][0];
}

// Helper function to generate a random color for each contact
function getRandomColor() {
    const colors = ["#FF5733", "#33C3FF", "#7D3CFF", "#FFC300", "#DAF7A6"];
    return colors[Math.floor(Math.random() * colors.length)];
}

async function loadAssignedContacts(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        
        // Falls assignedTo nicht existiert, setze ein leeres Array
        const assignedContacts = taskData && taskData.assignedTo ? taskData.assignedTo : [];
        
        console.log("Geladene zugewiesene Kontakte:", assignedContacts); // Debugging
        
        displayAssignedContacts(assignedContacts); // Zeige die Kontakte im UI an
    } catch (error) {
        console.error("Fehler beim Laden der zugewiesenen Kontakte:", error);
    }
}


function displayAssignedContacts(contacts) {
    const assignedToContainer = document.getElementById("aktivContactsEdit");
    assignedToContainer.innerHTML = ""; // Vorherige Inhalte löschen

    contacts.forEach(contact => {
        const initials = getInitials(contact);
        const color = getColor(contact);

        // Erstelle das contactBubble-Element
        const contactElement = document.createElement("div");
        contactElement.classList.add("contactBubble");
        contactElement.style.backgroundColor = color;
        contactElement.textContent = initials;
        contactElement.setAttribute("data-name", contact);

        // Füge Event-Listener hinzu, um Bubble bei Klick zu entfernen
        contactElement.addEventListener("click", () => {
            assignedToContainer.removeChild(contactElement);
        });

        assignedToContainer.appendChild(contactElement);
    });
}

// Function to load contacts from Firebase
async function loadContacts() {
    try {
        const contactsData = await loadData("contacts"); // Adjust path if needed
        return contactsData ? Object.values(contactsData) : []; // Convert Firebase object to an array
    } catch (error) {
        console.error("Error loading contacts:", error);
        return [];
    }
}

async function populateContactDropdownFromFirebase() {
    const contacts = await loadContacts(); // Kontakte aus Firebase laden
    const dropdownContainer = document.getElementById("contactDropdownEdit");
    dropdownContainer.innerHTML = ""; // Vorhandene Kontakte im Dropdown löschen

    console.log("Geladene Kontakte:", contacts); // Kontakte überprüfen

    if (!contacts || contacts.length === 0) {
        console.log("Keine Kontakte geladen");
        return; // Keine Kontakte gefunden, Abbruch
    }

    contacts.forEach(contact => {
        const name = contact.name || contact; // Wenn Kontaktobjekt einen Namen hat, diesen verwenden
        const initials = getInitials(name);
        const color = getColor(name);

        // Kontakt-Element erstellen
        const contactItem = document.createElement("div");
        contactItem.classList.add("contactDropdownItem");

        // Kontakt-Bubble erstellen
        const contactBubble = document.createElement("div");
        contactBubble.classList.add("contactBubble");
        contactBubble.style.backgroundColor = color;
        contactBubble.textContent = initials;

        // Kontaktname anzeigen
        const contactName = document.createElement("span");
        contactName.classList.add("contactName");
        contactName.textContent = name;

        // Kontakt-Bubble und Namen dem Dropdown-Item hinzufügen
        contactItem.appendChild(contactBubble);
        contactItem.appendChild(contactName);

        // Event-Listener zum Auswählen eines Kontakts
        contactItem.addEventListener("click", () => {
            addContactToAssignedList(name, initials, color); // Zum ausgewählten Kontakt hinzufügen
            dropdownContainer.style.display = "none"; // Dropdown nach Auswahl ausblenden
        });

        // Kontakt zum Dropdown-Container hinzufügen
        dropdownContainer.appendChild(contactItem);
    });

    console.log("Dropdown-Container nach dem Befüllen:", dropdownContainer);
}

// Initialize the dropdown on page load
populateContactDropdownFromFirebase();


// Toggle dropdown visibility when "Select contacts to assign" is clicked
document.getElementById("contactsEdit").addEventListener("click", () => {
    const dropdown = document.getElementById("contactDropdownEdit");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    const dropdown = document.getElementById("contactDropdownEdit");
    const target = event.target;
    if (!dropdown.contains(target) && target.id !== "contactsEdit") {
        dropdown.style.display = "none";
    }
});

function addContactToAssignedList(name, initials, color) {
    const assignedContainer = document.getElementById("aktivContactsEdit");

    // Prüfen, ob der Kontakt schon vorhanden ist
    const isAlreadyAssigned = Array.from(assignedContainer.children).some(
        el => el.getAttribute("data-name") === name
    );

    if (isAlreadyAssigned) return; 

    // Kontakt-Bubble erstellen
    const contactBubble = document.createElement("div");
    contactBubble.classList.add("contactBubble");
    contactBubble.style.backgroundColor = color;
    contactBubble.textContent = initials;
    contactBubble.setAttribute("data-name", name); 

    // Entfernen, wenn angeklickt
    contactBubble.addEventListener("click", () => {
        assignedContainer.removeChild(contactBubble);
    });

    assignedContainer.appendChild(contactBubble);
}


function displayAssignedContacts(contacts) {
    const assignedToContainer = document.getElementById("aktivContactsEdit");
    assignedToContainer.innerHTML = ""; // Vorherige Inhalte löschen

    contacts.forEach(contact => {
        const initials = getInitials(contact);
        const color = getColor(contact); // Verwende die Funktion getColor, um die Farbe basierend auf dem Namen zu erhalten

        // Erstelle das contactBubble-Element
        const contactElement = document.createElement("div");
        contactElement.classList.add("contactBubble");
        contactElement.style.backgroundColor = color;
        contactElement.textContent = initials;
        contactElement.setAttribute("data-name", contact); // Name als Attribut speichern

        // Füge einen Event-Listener hinzu, um die Bubble beim Klicken zu entfernen (falls gewünscht)
        contactElement.addEventListener("click", () => {
            assignedToContainer.removeChild(contactElement);
        });

        // Füge das Element zum Container hinzu
        assignedToContainer.appendChild(contactElement);
    });
}


// Anzeige der Subtasks in der Edit-Card
function displaySubtasks(subtasks, taskId) {
    const subTaskListContainer = document.getElementById("subTaskListEdit");
    subTaskListContainer.innerHTML = "";

    if (!subtasks || subtasks.length === 0) {
        console.warn("Keine Subtasks gefunden für Task:", taskId);
        return;
    }

    subtasks.forEach((subtask, index) => {
        const title = subtask && subtask.title ? subtask.title : "Untitled";

        const subTaskItem = document.createElement("div");
        subTaskItem.classList.add("subTask");
        subTaskItem.setAttribute("data-index", index);

        const leftContainer = document.createElement("div");
        leftContainer.classList.add("leftContainerSubTask");

        const subTaskText = document.createElement("span");
        subTaskText.textContent = title;
        subTaskText.classList.add("subTaskText");

        leftContainer.appendChild(subTaskText);

        const rightContainer = document.createElement("div");
        rightContainer.classList.add("rightContainerSubTask");

        const deleteButton = document.createElement("img");
        deleteButton.src = "./assets/img/delete.svg";
        deleteButton.alt = "Delete";
        deleteButton.onclick = () => deleteSubtaskEdit(index, taskId);

        rightContainer.appendChild(deleteButton);

        subTaskItem.appendChild(leftContainer);
        subTaskItem.appendChild(rightContainer);

        subTaskListContainer.appendChild(subTaskItem);
    });
}


async function addNewSubtaskEdit(event) {
    // Hole das Eingabefeld und den Text des neuen Subtasks
    let newSubTaskInput = document.getElementById('subTaskInputEdit');
    let newSubTaskValue = newSubTaskInput.value.trim(); // Entfernt überflüssige Leerzeichen

    // Verhindere das Hinzufügen von leeren Subtasks
    if (newSubTaskValue === '') {
        return false;
    }

    // Hole die Task-ID aus dem Edit-Overlay
    const taskId = document.getElementById("edit-overlay").getAttribute("data-task-id");

    try {
        // Lade die vorhandenen `newSubtask` Daten (falls vorhanden) aus Firebase
        const taskData = await loadData(`tasks/${taskId}`);
        const existingNewSubtasks = taskData.newSubtask || {};

        // Berechne den nächsten Index für den neuen Subtask in der `newSubtask` Kategorie
        const newSubtaskIndex = Object.keys(existingNewSubtasks).length;

        // Speichere den neuen Subtask in Firebase unter der neuen Kategorie `newSubtask`
        await updateData(`tasks/${taskId}/newSubtask/${newSubtaskIndex}`, newSubTaskValue);

        // Leere das Eingabefeld
        newSubTaskInput.value = '';

        // Lade die aktuellen Daten neu und aktualisiere die Benutzeroberfläche
        await reloadTaskDataAndUpdateUI(taskId);

    } catch (error) {
        console.error("Fehler beim Hinzufügen des Subtasks in der neuen Kategorie `newSubtask` in Firebase:", error);
    }
}

function renderSubtasks() {
    const subTaskListContainer = document.getElementById("subTaskListEdit");
    subTaskListContainer.innerHTML = "";

    // Zeige alle bestehenden `newSubtask` Elemente an
    subTasks.forEach((subtask, index) => {
        const subTaskItem = document.createElement("div");
        subTaskItem.classList.add("subTask");
        
        const leftContainer = document.createElement("div");
        leftContainer.classList.add("leftContainerSubTask");
        leftContainer.textContent = subtask;

        const rightContainer = document.createElement("div");
        rightContainer.classList.add("rightContainerSubTask");

        // Optional: Edit- und Delete-Buttons
        const editButton = document.createElement("img");
        editButton.src = "./assets/img/edit.svg";
        editButton.alt = "Edit";
        editButton.onclick = () => editSubtaskEdit(index);

        const deleteButton = document.createElement("img");
        deleteButton.src = "./assets/img/delete.svg";
        deleteButton.alt = "Delete";
        deleteButton.onclick = () => deleteSubtaskEdit(index);

        rightContainer.appendChild(editButton);
        rightContainer.appendChild(deleteButton);

        subTaskItem.appendChild(leftContainer);
        subTaskItem.appendChild(rightContainer);
        subTaskListContainer.appendChild(subTaskItem);
    });
}

// Aktualisiere UI und lade Daten neu
async function reloadTaskDataAndUpdateUI(taskId) {
    await loadTodosFromFirebase();
    await loadPositionsFromFirebase();
    await loadSubtaskStatusesFromFirebase();
    updateHTML();

    const editOverlay = document.getElementById("edit-overlay");
    if (editOverlay && !editOverlay.classList.contains("hidden")) {
        await loadTaskDetails(taskId);
    }
    const expandedCardOverlay = document.getElementById("card-overlay");
    if (expandedCardOverlay && !expandedCardOverlay.classList.contains("hidden")) {
        const task = todos.find((t) => t.id === taskId);
        expandedCardOverlay.innerHTML = generateExpandedCardHTML(task);
    }
}


// Funktion zum Löschen eines Subtasks und Entfernen aus Firebase
async function deleteSubtaskEdit(index, taskId) {
    console.log("Versuche, Subtask und Subtask-Status zu löschen - Index:", index, "Task ID:", taskId);

    try {
        // Lade die Task-Daten, um zu überprüfen, ob der Subtask im `subtasks` oder `newSubtask` liegt
        const taskData = await loadData(`tasks/${taskId}`);

        // Bestimme den Subtask-Typ dynamisch
        let subtaskType = null;
        
        if (taskData.subtasks && taskData.subtasks[index]) {
            subtaskType = "subtasks";
        } else if (taskData.newSubtask && taskData.newSubtask[index]) {
            subtaskType = "newSubtask";
        } else {
            console.warn("Subtask nicht gefunden.");
            return; // Abbrechen, wenn der Subtask nicht existiert
        }

        // Subtask-Pfad basierend auf dem ermittelten Typ
        const subtaskPath = `tasks/${taskId}/${subtaskType}/${index}`;
        
        // Lösche den Subtask in Firebase
        await deleteData(subtaskPath);
        console.log(`Subtask bei ${subtaskPath} wurde erfolgreich in Firebase gelöscht.`);

        // Lösche den zugehörigen Subtask-Status in Firebase
        const subtaskStatusPath = `tasks/${taskId}/subtaskStatus/${index}`;
        await deleteData(subtaskStatusPath);
        console.log(`Subtask-Status bei ${subtaskStatusPath} wurde erfolgreich in Firebase gelöscht.`);
        
        // Lade die aktuellen Daten neu und aktualisiere die Benutzeroberfläche
        await reloadTaskDataAndUpdateUI(taskId);
    } catch (error) {
        console.error("Fehler beim Löschen des Subtasks oder Subtask-Status in Firebase:", error);
    }
}

async function deleteData(path) {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            console.error(`Löschen fehlgeschlagen mit Status: ${response.status} - ${response.statusText}`);
            throw new Error(`Fehler beim Löschen der Daten in Firebase: ${response.statusText}`);
        }
        console.log(`Daten erfolgreich gelöscht bei Pfad ${path}`);
    } catch (error) {
        console.error("Fehler beim Löschen der Daten in Firebase:", error);
    }
}

async function updateData(path, data) {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`, {
            method: data === null ? 'DELETE' : 'PUT', // Verwende DELETE, wenn data null ist
            body: data === null ? null : JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            console.error(`Löschen fehlgeschlagen mit Status: ${response.status} - ${response.statusText}`);
            throw new Error(`Fehler beim Aktualisieren der Daten in Firebase: ${response.statusText}`);
        }
        console.log(`Daten erfolgreich aktualisiert bei Pfad ${path}`);
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Daten in Firebase:", error);
    }
}

function showInputSubTasksEdit() {
    const inputContainer = document.getElementById("inputSubTaksClickContainerEdit");
    inputContainer.classList.toggle("visible"); 
}

function toggleSubtaskEditMode(subTaskText, subTaskInput) {
    subTaskText.style.display = "none";
    subTaskInput.style.display = "inline-block";
    subTaskInput.focus(); // Setzt den Fokus sofort auf das Eingabefeld zum Bearbeiten
}

// Funktion zum Schließen des Edit-Overlays
function closeEditOverlay() {
    const editOverlay = document.getElementById("edit-overlay");
    editOverlay.classList.add("hidden");

    document.body.classList.remove("no-scroll");
}

//außerhalb klicken schliessen //
document.getElementById("edit-overlay").addEventListener("click", function (event) {
    if (event.target === this) {
        closeEditOverlay();
    }
});