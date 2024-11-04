/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Funktion 1: Sammelt und validiert die Eingabedaten
function collectAndValidateTaskData() {
    let title = document.getElementById('title').value.trim();
    let description = document.getElementById('description').value.trim();
    let dueDate = document.getElementById('date').value;
    let category = document.getElementById('selectedCategory').textContent.trim();
    let prio = getSelectedPriority(); 
    let assignedTo = getAssignedContacts(); 
    let subtasks = [...subTasks]; 
    let isValid = validateTaskForm(title, dueDate, category);
    if (!isValid) {
        console.log('Form validation failed.');
        return null;
    } return {
        title, description, assignedTo, dueDate, prio, category, subtasks, createdAt: new Date().toISOString()
    };
}

// Funktion 2: Speichert die Aufgabe in der Datenbank
async function saveTaskToDatabase(task) {
    try {
        let result = await saveData('tasks', task);
        console.log('Task successfully created with key:', result.name);
        task.key = result.name;
        return task;
    } catch (error) {
        console.error('Error creating task:', error);
        showErrorNotification('Fehler beim Erstellen der Aufgabe. Bitte versuchen Sie es erneut.');
        return null;
    }
}

// Funktion 3: Hauptfunktion, die den gesamten Prozess koordiniert
async function createNewTask() {
    let taskData = collectAndValidateTaskData();
    if (!taskData) return;
    let savedTask = await saveTaskToDatabase(taskData);
    if (savedTask) {
        newTasks.push(savedTask);
        resetNewTask();
        showTaskAddedNotification();
    }
}

// Funktion zum Ermitteln der ausgewählten Priorität
function getSelectedPriority() {
    let prio = '';
    if (document.querySelector('.prioButtonUrgent.active')) {
        prio = 'urgent';
    } else if (document.querySelector('.prioButtonMedium.active')) {
        prio = 'medium';
    } else if (document.querySelector('.prioButtonLow.active')) {
        prio = 'low';
    }
    return prio;
}

// Funktion zum Sammeln der zugewiesenen Kontakte
function getAssignedContacts() {
    let aktivContactsDiv = document.getElementById('aktivContacts');
    let contacts = [];
    aktivContactsDiv.querySelectorAll('span.contactIcon').forEach(contactSpan => {
        contacts.push(contactSpan.dataset.contact); 
    });
    return contacts;
}

// Validierungsfunktion für das Task-Formular
function validateTaskForm(title, dueDate, category) {
    let isValid = true;
    if (!title) {
        fieldRequiredTitle();
        isValid = false;
    }
    if (!dueDate) {
        fieldRequiredDate();
        isValid = false;
    }
    if (category === 'Select task category') {
        fieldRequiredCategory();
        isValid = false;
    }
    return isValid;
}

// Funktion zum Anzeigen von Fehlerbenachrichtigungen (optional)
function showErrorNotification(message) {
    let errorPopup = document.getElementById('popupError'); 
    if (errorPopup) {
        errorPopup.querySelector('p').textContent = message;
        errorPopup.classList.add('show');
        setTimeout(() => {
            errorPopup.classList.remove('show');
        }, 3000);
    }
}