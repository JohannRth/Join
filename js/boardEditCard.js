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
    const dropdown = document.getElementById("contactDropdownEdit");
    if (!contacts?.length) return dropdown.innerHTML = "";

    dropdown.innerHTML = contacts.map(createContactHTML).join("");

    dropdown.querySelectorAll(".contactDropdownItem").forEach((item, i) =>
        item.addEventListener("click", () => {
            const name = contacts[i].name || contacts[i];
            addContactToAssignedList(name, getInitials(name), getColor(name));
            dropdown.style.display = "none";
        }));
}

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

function displaySubtasks(subtasks, taskId) {
    const container = document.getElementById("subTaskListEdit");
    container.innerHTML = "";

    if (!subtasks?.length) return console.warn("Keine Subtasks für Task:", taskId);

    subtasks.forEach((subtask, index) => 
        container.innerHTML += generateSubtaskHTML(subtask, index, taskId)
    );
}

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
    } catch{}
}

async function deleteSubtaskEdit(index) {
    const taskId = document.getElementById("edit-overlay").getAttribute("data-task-id");

    try {
        await deleteData(`tasks/${taskId}/subtasks/${index}`);
        
        await reloadSubtasks(taskId);

    } catch {}
}

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
    } catch {}
}

function reorderSubtasks(subtasks, index) {
    const updated = subtasks ? Object.values(subtasks).filter((_, i) => i !== index) : [];
    return Object.fromEntries(updated.map((subtask, i) => [i, subtask]));
}

async function updateReorderedStatuses(taskId, statuses) {
    await Promise.all(Object.entries(statuses).map(([key, value]) =>
        updateData(`subtaskStatus/${taskId}/${key}`, value)
    ));
    const lastKey = Object.keys(statuses).length;
    await deleteData(`subtaskStatus/${taskId}/${lastKey}`);
}

function reorderStatuses(statuses, index) {
    return Object.fromEntries(Object.entries(statuses)
        .map(([key, value]) => [parseInt(key, 10), value])
        .filter(([i]) => i !== index)
        .map(([i, value], newIndex) => [i > index ? newIndex - 1 : newIndex, value]));
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
    inputContainer.classList.toggle("visible"); // Schaltet die Klasse 'visible' um
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
        const updatedData = await getUpdatedTaskData(taskId);
        if (!updatedData) return;

        await updateData(`tasks/${taskId}`, updatedData);
        deletedSubtasks = [];
        closeEditOverlay();
        await reloadTaskDataAndUpdateUI(taskId);
        updateHTML();

        const cardOverlay = document.getElementById("card-overlay");
        if (cardOverlay && !cardOverlay.classList.contains("hidden")) openCardOverlay(taskId);
    } catch {}
}

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


flatpickr("#edit-due-date", {
    dateFormat: "Y-m-d", // Format, das mit dem Eingabefeld übereinstimmt
    onChange: function(selectedDates, dateStr, instance) {
        // Fügt das ausgewählte Datum in das Feld ein
        document.getElementById("edit-due-date").value = dateStr;
    }
});