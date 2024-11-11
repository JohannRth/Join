// Titel Card und Subtask-Initialisierung
let todos = [];

// Event Listener für das Laden der Todos und Positionen
document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();
    await loadPositionsFromFirebase();
    await loadSubtaskStatusesFromFirebase();
    updateHTML();
    initializeDragAreas();
});

function initializeDragAreas() {
    const dragAreas = document.querySelectorAll(".drag-area");
    dragAreas.forEach((area) => {
        area.addEventListener("dragover", allowDrop);
        area.addEventListener("drop", dropTask);
    });
}

// Funktion zum Laden der Todos aus Firebase
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
        console.error("Fehler beim Laden der Daten aus Firebase:", error);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function dragTask(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.target.classList.add("dragging");
    ev.target.style.cursor = "grabbing";
}

// Funktion zum Erhalten der Initialen des Vor- und Nachnamens
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    const nameParts = name.trim().split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Anpassung der generateTodoHTML-Funktion
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


// Edit Card //

// Funktion zum Öffnen des Edit-Overlays und Laden der aktuellen Task-Daten
async function openEditOverlay(taskId) {
    await loadTaskDetails(taskId);

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

            // Load and display subtasks
            if (taskData.subtasks) {
                const subtasksArray = Array.isArray(taskData.subtasks)
                    ? taskData.subtasks
                    : Object.values(taskData.subtasks); // Convert to array if it's an object
                console.log("Loaded subtasks for edit card:", subtasksArray); // Debugging line
                displaySubtasks(subtasksArray);
            } else {
                console.warn("No subtasks found for task:", taskId);
            }

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
    const contacts = await loadContacts(); // Load contacts from Firebase
    const dropdownContainer = document.getElementById("contactDropdownEdit");
    dropdownContainer.innerHTML = ""; // Clear any existing contacts in the dropdown

    contacts.forEach(contact => {
        const name = contact.name || contact; // Adjust if contact is an object with a 'name' property
        const initials = getInitials(name);
        const color = getColor(name);

        // Create dropdown item container
        const contactItem = document.createElement("div");
        contactItem.classList.add("contactDropdownItem");

        // Create contact bubble for the left side
        const contactBubble = document.createElement("div");
        contactBubble.classList.add("contactBubble");
        contactBubble.style.backgroundColor = color;
        contactBubble.textContent = initials;

        // Create contact name for the right side
        const contactName = document.createElement("span");
        contactName.classList.add("contactName");
        contactName.textContent = name;

        // Append bubble and name to the dropdown item
        contactItem.appendChild(contactBubble);
        contactItem.appendChild(contactName);

        // Add event listener for selecting a contact
        contactItem.addEventListener("click", () => {
            addContactToAssignedList(name, initials, color); // Add contact to assigned list
            dropdownContainer.style.display = "none"; // Hide dropdown after selection
        });

        // Add the dropdown item to the container
        dropdownContainer.appendChild(contactItem);
    });
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


async function deleteSubtaskEdit(index, taskId) {
    console.log("Versuche, Subtask zu löschen - Index:", index, "Task ID:", taskId);

    // Überprüfe, ob die Aufgabe in der lokalen `todos`-Liste existiert
    const task = todos.find(t => t.id === taskId);
    if (!task || !task.subtasks) {
        console.error("Task oder Subtasks nicht gefunden für ID:", taskId);
        return;
    }

    // Entferne den Subtask lokal
    task.subtasks.splice(index, 1);

    // Lösche den Subtask in Firebase
    const subtaskPath = `tasks/${taskId}/subtasks/${index}`;
    try {
        console.log(`Versuche, Subtask in Firebase unter ${subtaskPath} zu löschen.`);

        // Setze den Subtask in Firebase auf `null`, um ihn zu löschen
        await deleteData(subtaskPath);
        console.log(`Subtask bei ${subtaskPath} wurde erfolgreich in Firebase gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen des Subtasks in Firebase:", error);
    }

    // Lade die aktuellen Daten neu und aktualisiere die Benutzeroberfläche
    await reloadTaskDataAndUpdateUI(taskId);
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

    subTaskInput.focus(); // Focus on the input field for immediate editing
}

async function deleteSubtaskEdit(index, taskId) {
    console.log("Delete Subtask Called - Index:", index, "Task ID:", taskId); // Debugging line

    if (!taskId) {
        console.error("Task ID is undefined. Cannot proceed with deletion.");
        return;
    }

    const task = todos.find(t => t.id === taskId); // Find the task with the specific ID
    if (!task) {
        console.error("Task not found for ID:", taskId);
        return;
    }

    // Entferne die Subtask lokal
    if (task.subtasks && Array.isArray(task.subtasks)) {
        task.subtasks.splice(index, 1); // Entferne Subtask aus Array
        console.log("Subtask removed from array.");
    } else {
        console.warn("Subtask not found at index:", index);
        return;
    }

    // Lösche das Subtask in Firebase
    try {
        await updateData(`tasks/${taskId}/subtasks/${index}`, null); // Entferne Subtask in Firebase
        console.log("Subtask deleted from Firebase.");
    } catch (error) {
        console.error("Error deleting subtask from Firebase:", error);
    }

    // Aktualisiere die Anzeige nach dem Löschen
    displaySubtasks(task.subtasks, {}, taskId); // Subtasks erneut anzeigen
}

async function addNewSubtaskEdit(event) {
    event.preventDefault();
    const inputField = document.getElementById("subTaskInputEdit");
    const newSubtaskTitle = inputField.value.trim();

    if (newSubtaskTitle === "") {
        alert("Subtask title cannot be empty.");
        return;
    }

    const taskId = getCurrentTaskId();
    const task = todos.find(t => t.id === taskId);

    if (!task) {
        console.error("Task not found for ID:", taskId);
        return;
    }

    const newSubtask = { title: newSubtaskTitle, completed: false };
    task.subtasks = task.subtasks || [];
    task.subtasks.push(newSubtask);

    try {
        const newIndex = task.subtasks.length - 1;
        await updateData(`tasks/${taskId}/subtasks/${newIndex}`, { title: newSubtaskTitle });
        console.log("New subtask added to Firebase.");
    } catch (error) {
        console.error("Error adding subtask to Firebase:", error);
    }

    inputField.value = "";
    displaySubtasks(task.subtasks, {}, taskId);
}

function showInputSubTasksEdit() {
    // Example logic to display an input for adding a subtask
    const subTaskInputContainer = document.getElementById("inputSubTaksClickContainerEdit");
    if (subTaskInputContainer) {
        subTaskInputContainer.style.display = "block";
    } else {
        console.error("Element with ID 'inputSubTaksClickContainerEdit' not found.");
    }
}

function getCurrentTaskId() {
    const editOverlay = document.getElementById("edit-overlay");
    return editOverlay.getAttribute("data-task-id");

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

// Edit Card //

// ExpandedCard
function generateExpandedCardHTML(element) {
    const taskTypeStyle = element.type === "Technical Task"
        ? `height: 36px; width: 208px; border-radius: 8px; padding: 4px 16px; background-color: #1FD7C1; color: #FFFFFF; font-size: 23px; font-weight: 400;`
        : `width: 164px; height: 36px; border-radius: 8px; padding: 4px 16px; background-color: #0038ff; color: white; font-weight: 400; font-size: 23px; display: flex; align-items: center; justify-content: center;`;

    let priorityLabel = "";
    let priorityIconSrc = "";
    if (element.priority === "urgent") {
        priorityLabel = "Urgent";
        priorityIconSrc = "./assets/img/urgent-titel-card.svg";
    } else if (element.priority === "medium") {
        priorityLabel = "Medium";
        priorityIconSrc = "./assets/img/medium-titel-card.svg";
    } else if (element.priority === "low") {
        priorityLabel = "Low";
        priorityIconSrc = "./assets/img/low-titel-card.svg";
    } else {
        priorityLabel = "Default";
        priorityIconSrc = "./assets/img/default-titel-card.svg";
    }

    const dueDate = element.dueDate ? new Date(element.dueDate).toLocaleDateString("de-DE") : "Kein Datum";

    // Subtasks und NewSubtasks kombinieren und anzeigen
    const subtasksHTML = element.subtasks.map((subtask, index) => `
    <div class="subtask-item" style="display: flex; align-items: center; gap: 16px;">
        <input type="checkbox" 
               id="subtask-checkbox-${element.id}-${index}" 
               onclick="toggleSubtask('${element.id}', ${index})" 
               class="styled-checkbox"
               ${subtask.completed ? "checked" : ""}>
        <label for="subtask-checkbox-${element.id}-${index}">${subtask.title}</label>
    </div>
    `).join('');

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
                <span class="priority-focus-overlay">${priorityLabel}</span>
                <img src="${priorityIconSrc}" alt="Priority ${priorityLabel}" class="priority-img-overlay">
            </div>    
        </div>
        <span class="task-assigned-line-overlay">Assigned To:</span>
        <div class="task-assigned-container-overlay">
                ${element.contacts.map(contact => `
                <div class="person-container-overlay">
                    <span class="person-circle-overlay" style="background-color: ${getColor(contact)};">${getInitials(contact)}</span>
                    <span class="person-name-overlay">${contact}</span>
                </div>
            `).join('')}
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
    </div> `;
}

// Subtasks //
async function toggleSubtask(taskId, subtaskIndex) {
    const task = todos.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
        console.error("Subtask nicht gefunden oder ungültiger Index:", taskId, subtaskIndex);
        return;
    }

    // Status umschalten
    const subtask = task.subtasks[subtaskIndex];
    subtask.completed = !subtask.completed;

    // Speichere den neuen Status in `subtaskStatus` in Firebase
    await saveSubtaskStatus(taskId, subtaskIndex, subtask.completed);

    // Aktualisiere die Anzahl abgeschlossener Subtasks
    task.completedSubtasks = task.subtasks.filter(st => st.completed).length;

    // Berechne das Fortschrittsverhältnis und aktualisiere die progressBar
    const totalSubtasks = task.subtasks.length;
    const percentage = totalSubtasks > 0 ? (task.completedSubtasks / totalSubtasks) * 100 : 0;

    updateProgressBar(taskId, percentage, task.completedSubtasks, totalSubtasks);
}

async function saveSubtaskStatus(taskId, subtaskIndex, isChecked) {
    const path = `subtaskStatus/${taskId}/${subtaskIndex}`;
    console.log(`Speichere Subtask-Status an Pfad ${path}:`, isChecked);
    await updateData(path, { completed: isChecked });
}

async function loadSubtaskStatusesFromFirebase() {
    const subtaskStatuses = await loadData("subtaskStatus");

    // Zuweisung des Subtask-Status in `todos`
    todos.forEach(task => {
        if (subtaskStatuses[task.id]) {
            task.subtasks.forEach((subtask, index) => {
                if (subtaskStatuses[task.id][index] && subtaskStatuses[task.id][index].completed !== undefined) {
                    subtask.completed = subtaskStatuses[task.id][index].completed || false;
                } else {
                    subtask.completed = false; // Standardwert, falls `completed` nicht definiert ist
                }
            });
        }
    });
}

// Subtasks //

//Progress Bar //
function updateProgressBar(taskId) {
    const task = todos.find((t) => t.id === taskId);
    if (!task) return;

    const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
    const totalSubtasks = task.subtasks.length;
    const percentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    // Aktualisiere die Anzeige des Fortschrittsbalkens
    const taskElement = document.getElementById(taskId);
    if (!taskElement) return;

    const progressBar = taskElement.querySelector(".progress-fill");
    const progressText = taskElement.querySelector(".progress-text");

    if (progressBar && progressText) {
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
    }
}
//Progress Bar //
//card-overlay
function openCardOverlay(taskId) {
    const overlay = document.getElementById("card-overlay");
    const task = todos.find((t) => t.id === taskId); // Hier wird die id als String verglichen
    overlay.innerHTML = generateExpandedCardHTML(task);
    overlay.classList.remove("hidden");

    document.body.classList.add("no-scroll");

    // Hinzufügen des taskId als Attribut für Delete-Button
    const deleteButton = overlay.querySelector(".action-btn-overlay");
    deleteButton.setAttribute("onclick", `deleteTask('${taskId}')`);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            closeCardOverlay();
        }
    });
}

function closeCardOverlay() {
    const overlay = document.getElementById("card-overlay");
    overlay.classList.add("hidden");

    document.body.classList.remove("no-scroll");
}

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

// Drag-Area zähler //

function getTodoCount() { // ToDo
    const todoContainer = document.getElementById("todo");
    const tasks = todoContainer.querySelectorAll(".titel-card");
    return tasks.length;
}

function updateTodoCount() {
    const todoCount = getTodoCount();
    localStorage.setItem('todoCount', todoCount);
}

function getDoneCount() { // Done
    const doneContainer = document.getElementById("done");
    const tasks = doneContainer.querySelectorAll(".titel-card");
    return tasks.length;
}

function updateDoneCount() {
    const doneCount = getDoneCount();
    localStorage.setItem('doneCount', doneCount);
}

function getBoardTaskCount() { // Alle
    const todoTasks = document.getElementById("todo").querySelectorAll(".titel-card");
    const inProgressTasks = document.getElementById("inProgress").querySelectorAll(".titel-card");
    const feedbackTasks = document.getElementById("awaitFeedback").querySelectorAll(".titel-card");
    const doneTasks = document.getElementById("done").querySelectorAll(".titel-card");

    const totalTasks = todoTasks.length + inProgressTasks.length + feedbackTasks.length + doneTasks.length;
    return totalTasks;
}

function updateBoardTaskCount() {
    const boardTaskCount = getBoardTaskCount();
    localStorage.setItem('boardTaskCount', boardTaskCount);
}

function getInProgressCount() { // In Progress
    const inProgressTasks = document.getElementById("inProgress").querySelectorAll(".titel-card");
    return inProgressTasks.length;
}

function updateInProgressCount() {
    const inProgressCount = getInProgressCount();
    localStorage.setItem('inProgressCount', inProgressCount);
}

function getAwaitFeedbackCount() { // Await Feedback
    const feedbackTasks = document.getElementById("awaitFeedback").querySelectorAll(".titel-card");
    return feedbackTasks.length;
}

function updateAwaitFeedbackCount() {
    const feedbackCount = getAwaitFeedbackCount();
    localStorage.setItem('feedbackCount', feedbackCount);
}

// Add Task Overlay Card //

function addTaskExpanded() {
    const overlay = document.getElementById('add-task-overlay');
    overlay.classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

function closeAddTaskOverlay(event) {
    const overlay = document.getElementById('add-task-overlay');
    if (event.target === overlay || event.target.classList.contains('close-btn-overlay')) {
        overlay.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();
    updateHTML();
});

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; // Standardfarbe
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
}

async function deleteTask(taskId) {
    // Entferne die Aufgabe aus der `todos`-Liste
    todos = todos.filter(task => task.id !== taskId);

    // Firebase-Pfade für die spezifische Aufgabe, deren Subtask-Status und Position
    const taskPath = `tasks/${taskId}`;
    const subtaskStatusPath = `subtaskStatus/${taskId}`;
    const positionPath = `positionDropArea/${taskId}`;
    
    try {
        // Hauptaufgabe in Firebase löschen
        await deleteData(taskPath);
        console.log(`Task mit ID ${taskId} wurde erfolgreich in Firebase gelöscht.`);
        
        // Zugehörigen Subtask-Status in Firebase löschen
        await deleteData(subtaskStatusPath);
        console.log(`Subtask-Status für Task ${taskId} wurde erfolgreich in Firebase gelöscht.`);
        
        // Position der Aufgabe in Firebase löschen
        await deleteData(positionPath);
        console.log(`Position für Task ${taskId} wurde erfolgreich in Firebase gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen der Daten aus Firebase:", error);
        return; // Beende die Funktion, falls ein Fehler auftritt
    }

    // HTML aktualisieren, um die Aufgabe von der Oberfläche zu entfernen
    updateHTML();
    closeCardOverlay(); // Schließe das Overlay nach dem Löschen
}

// Funktion zum Löschen der Daten aus Firebase
async function deleteData(path) {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Fehler beim Löschen der Daten aus Firebase: ${response.statusText}`);
        }
        console.log(`Daten bei Pfad ${path} wurden erfolgreich gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen der Daten aus Firebase:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();         // Lade die `todos` Daten
    await loadPositionsFromFirebase();     // Lade und setze die Positionen
    await loadSubtaskStatusesFromFirebase(); // Lade und setze die Subtask-Checkbox-Status
    updateHTML();                          // Aktualisiere das HTML mit allen geladenen Daten
});

// Todo's position //
async function savePosition(taskId, position) {
    const path = `positionDropArea/${taskId}`;
    await updateData(path, position);
}

async function loadPositionsFromFirebase() {
    const positionsData = await loadData("positionDropArea");
    console.log("Geladene Positionen:", positionsData); // Debugging: Überprüfen der geladenen Positionen

    for (const taskId in positionsData) {
        const position = positionsData[taskId];
        const task = todos.find((t) => t.id === taskId || t.id === parseInt(taskId));

        if (task) {
            task.category = position; // Setze die Position basierend auf den Daten in `positionDropArea`
            console.log(`Task ${taskId} auf Position ${position} gesetzt`); // Debugging: Überprüfen der aktualisierten Positionen
        }
    }
}
// Todo's position //

// cross link //
document.addEventListener("DOMContentLoaded", () => {
    const crossTitleButtons = document.querySelectorAll(".cross-titel-button");

    crossTitleButtons.forEach(button => {
        button.addEventListener("click", openAddTaskOverlay);
    });
});

function openAddTaskOverlay() {
    const overlay = document.getElementById("add-task-overlay");
    overlay.classList.remove("hidden");
    document.body.classList.add("no-scroll"); // Verhindert das Scrollen im Hintergrund
}
