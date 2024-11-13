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
        if (!taskData) return;

        const { title, description, dueDate, prio, subtasks, newSubtask } = taskData;
        if (title) document.getElementById("edit-title-edit").value = title;
        if (description) document.getElementById("edit-description").value = description;
        if (dueDate) document.getElementById("edit-due-date").value = dueDate;
        if (prio) setPriorityEdit(prio);

        const getSubtasks = (data) => data ? Object.values(data).map(title => ({ title })) : [];
        displaySubtasks([...getSubtasks(subtasks), ...getSubtasks(newSubtask)], taskId);
        
    } catch (error) {}
}

function highlightPriorityButton(priority) {
    const buttons = {
        urgent: document.querySelector(".prioButtonUrgentEdit"),
        medium: document.querySelector(".prioButtonMediumEdit"),
        low: document.querySelector(".prioButtonLowEdit")
    };

    Object.values(buttons).forEach(button => button.classList.remove("active"));
    if (buttons[priority]) buttons[priority].classList.add("active");
}

let currentPriority = ""; 

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

function getInitials(name) {
    const nameParts = name.split(" ");
    return nameParts.length >= 2 
        ? nameParts[0][0] + nameParts[1][0]
        : nameParts[0][0];
}

function getRandomColor() {
    const colors = ["#FF5733", "#33C3FF", "#7D3CFF", "#FFC300", "#DAF7A6"];
    return colors[Math.floor(Math.random() * colors.length)];
}

async function loadAssignedContacts(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        const assignedContacts = taskData?.assignedTo || [];
        displayAssignedContacts(assignedContacts);
    } catch (error) {}
}

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

async function loadContacts() {
    try {
        const contactsData = await loadData("contacts"); 
        return contactsData ? Object.values(contactsData) : []; 
    } catch (error) {
        console.error("Error loading contacts:", error);
        return [];
    }
}

async function populateContactDropdownFromFirebase() {
    const contacts = await loadContacts();
    const dropdownContainer = document.getElementById("contactDropdownEdit");
    dropdownContainer.innerHTML = "";

    if (!contacts || contacts.length === 0) return;

    contacts.forEach(contact => {
        const name = contact.name || contact;
        const contactItem = document.createElement("div");
        contactItem.classList.add("contactDropdownItem");

        const contactBubble = document.createElement("div");
        contactBubble.classList.add("contactBubble");
        contactBubble.style.backgroundColor = getColor(name);
        contactBubble.textContent = getInitials(name);

        contactItem.append(contactBubble, Object.assign(document.createElement("span"), {
            className: "contactName", textContent: name
        }));
        
        contactItem.addEventListener("click", () => {
            addContactToAssignedList(name, getInitials(name), getColor(name));
            dropdownContainer.style.display = "none";
        });
        
        dropdownContainer.appendChild(contactItem);
    });
}


populateContactDropdownFromFirebase();



document.getElementById("contactsEdit").addEventListener("click", () => {
    const dropdown = document.getElementById("contactDropdownEdit");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});


document.addEventListener("click", (event) => {
    const dropdown = document.getElementById("contactDropdownEdit");
    const target = event.target;
    if (!dropdown.contains(target) && target.id !== "contactsEdit") {
        dropdown.style.display = "none";
    }
});

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


function displayAssignedContacts(contacts) {
    const assignedToContainer = document.getElementById("aktivContactsEdit");
    assignedToContainer.innerHTML = "";

    contacts.forEach(contact => {
        const initials = getInitials(contact);
        const color = getColor(contact);
        const contactElement = document.createElement("div");
        contactElement.classList.add("contactBubble");
        contactElement.style.backgroundColor = color;
        contactElement.textContent = initials;
        contactElement.setAttribute("data-name", contact); 
        contactElement.addEventListener("click", () => {

            assignedToContainer.removeChild(contactElement);
        });
        assignedToContainer.appendChild(contactElement);
    });
}

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

async function addNewSubtaskEdit() {
    let newSubTaskInput = document.getElementById('subTaskInputEdit');
    let newSubTaskValue = newSubTaskInput.value.trim();

    if (newSubTaskValue === '') return;

    const taskId = document.getElementById("edit-overlay").getAttribute("data-task-id");

    try {
        // Fügen Sie den neuen Subtask zu Firebase hinzu
        const taskData = await loadData(`tasks/${taskId}`);
        const existingSubtasks = taskData.subtasks || {};
        const newSubtaskIndex = Object.keys(existingSubtasks).length;

        await updateData(`tasks/${taskId}/subtasks/${newSubtaskIndex}`, newSubTaskValue);

        // Eingabefeld leeren und die Subtasks neu laden und anzeigen
        newSubTaskInput.value = '';
        await reloadSubtasks(taskId);

    } catch (error) {
        console.error("Fehler beim Hinzufügen des Subtasks:", error);
    }
}

function editSubtaskEdit(index) {
    // Hier speichern wir die Änderungen im updatedSubtasks Array
    const subTaskText = document.querySelector(`[data-index="${index}"] .subTaskText`);
    if (subTaskText) {
        const updatedText = prompt("Ändere den Subtask:", subTaskText.textContent);
        if (updatedText) {
            updatedSubtasks[index] = updatedText;
        }
    }
    renderSubtaskEdit();  // Anzeige aktualisieren
}

function renderSubtaskEdit(subtasks) {
    const subTaskListContainer = document.getElementById("subTaskListEdit");
    subTaskListContainer.innerHTML = "";

    subtasks.forEach((subtask, index) => {
        const subTaskItem = document.createElement("div");
        subTaskItem.classList.add("subTask");
        subTaskItem.setAttribute("data-index", index);

        const leftContainer = document.createElement("div");
        leftContainer.classList.add("leftContainerSubTask");
        leftContainer.textContent = subtask;

        const rightContainer = document.createElement("div");
        rightContainer.classList.add("rightContainerSubTask");

        const deleteButton = document.createElement("img");
        deleteButton.src = "./assets/img/delete.svg";
        deleteButton.alt = "Delete";
        deleteButton.onclick = () => deleteSubtaskEdit(index);

        rightContainer.appendChild(deleteButton);

        subTaskItem.appendChild(leftContainer);
        subTaskItem.appendChild(rightContainer);
        subTaskListContainer.appendChild(subTaskItem);
    });
}

async function reloadSubtasks(taskId) {
    try {
        const taskData = await loadData(`tasks/${taskId}`);
        const subtasks = taskData.subtasks ? Object.values(taskData.subtasks) : [];
        
        renderSubtaskEdit(subtasks);  // Aktualisiere die Subtask-Liste mit den neuen Daten
    } catch (error) {
        console.error("Fehler beim Laden der Subtasks:", error);
    }
}

async function reloadTaskDataAndUpdateUI(taskId) {
    try {
        // Lade alle relevanten Daten neu
        await loadTodosFromFirebase();       // Lädt alle Aufgaben
        await loadPositionsFromFirebase();   // Lädt alle Positionen
        await loadSubtaskStatusesFromFirebase(); // Lädt alle Subtask-Status

        // Aktualisiere das HTML (hier sollte das gesamte UI aktualisiert werden)
        updateHTML();

        // Wenn das Bearbeitungs-Overlay sichtbar ist, lade die Task-Details neu
        const editOverlay = document.getElementById("edit-overlay");
        if (editOverlay && !editOverlay.classList.contains("hidden")) {
            await loadTaskDetails(taskId);
        }

        // Wenn eine Kartenansicht (Overlay) geöffnet ist, lade die Kartendaten neu
        const expandedCardOverlay = document.getElementById("card-overlay");
        if (expandedCardOverlay && !expandedCardOverlay.classList.contains("hidden")) {
            const task = todos.find((t) => t.id === taskId);
            if (task) {
                expandedCardOverlay.innerHTML = generateExpandedCardHTML(task);  // Generiere das HTML neu
            }
        }
    } catch (error) {
        console.error("Fehler beim Aktualisieren des UI:", error);
    }
}

async function deleteSubtaskEdit(index) {
    const taskId = document.getElementById("edit-overlay").getAttribute("data-task-id");

    try {
        // Lösche den Subtask aus Firebase
        await deleteData(`tasks/${taskId}/subtasks/${index}`);
        
        // Subtasks neu laden und aktualisieren
        await reloadSubtasks(taskId);

    } catch (error) {
        console.error("Fehler beim Löschen des Subtasks:", error);
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
    } catch (error) {
    
    }
}

async function updateData(path, data) {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`, {
            method: 'PUT', // Verwende PUT statt PATCH
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            console.error(`Update fehlgeschlagen mit Status: ${response.status} - ${response.statusText}`);
            throw new Error(`Fehler beim Aktualisieren der Daten in Firebase: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Daten:", error);
    }
}

let newSubtasks = [];
let deletedSubtasks = [];

function showInputSubTasksEdit() {
    const inputContainer = document.getElementById("inputSubTaksClickContainerEdit");
    inputContainer.classList.toggle("visible"); 
}

function toggleSubtaskEditMode(subTaskText, subTaskInput) {
    subTaskText.style.display = "none";
    subTaskInput.style.display = "inline-block";
    subTaskInput.focus(); 
}

function closeEditOverlay() {
    const editOverlay = document.getElementById("edit-overlay");
    editOverlay.classList.add("hidden");

    document.body.classList.remove("no-scroll");
}

document.getElementById("edit-overlay").addEventListener("click", function (event) {
    if (event.target === this) {
        closeEditOverlay();
    }
});

async function confirmChanges(taskId) {
    try {
        const existingData = await loadData(`tasks/${taskId}`);
        if (!existingData) {
            console.error("Task nicht gefunden:", taskId);
            return;
        }

        // Aktuelle Felder auslesen
        const title = document.getElementById("edit-title-edit").value.trim();
        const description = document.getElementById("edit-description").value.trim();
        const dueDate = document.getElementById("edit-due-date").value;
        const priority = currentPriority;

        const assignedContacts = Array.from(document.getElementById("aktivContactsEdit").children)
            .map(contact => contact.getAttribute("data-name"));

        const updatedData = {
            ...existingData,
            title,
            description,
            dueDate,
            prio: priority,
            assignedTo: assignedContacts
        };

        // Daten in Firebase aktualisieren
        await updateData(`tasks/${taskId}`, updatedData);

        // Subtask-Listen leeren, nachdem Änderungen angewendet wurden
        deletedSubtasks = [];

        // Schließe das Bearbeitungs-Overlay
        closeEditOverlay();

        // Aktualisiere das Board und die erweiterte Kartenansicht
        await reloadTaskDataAndUpdateUI(taskId);

        console.log("Task erfolgreich aktualisiert:", updatedData);
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Tasks in Firebase:", error);
    }
}