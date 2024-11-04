/**
 * This function collects and validates task data from the form
 * 
 * @returns {Object|null} The collected task data if valid, null otherwise
 * 
 */
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


/**
 * This function saves a task to the database
 * 
 * @param {Object} task - The task object to be saved
 * @returns {Object|null} The saved task with its key if successful, null otherwise
 */
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


/**
 * This function coordinates the entire process of creating a new task
 *  
 */
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


/**
 * This function determines the selected priority for a task
 * 
 * @returns {string} The selected priority ('urgent', 'medium', or 'low')
 */
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


/**
 * This function collects the assigned contacts for a task
 * 
 * @returns {Array} An array of assigned contact names
 */
function getAssignedContacts() {
    let aktivContactsDiv = document.getElementById('aktivContacts');
    let contacts = [];
    aktivContactsDiv.querySelectorAll('span.contactIcon').forEach(contactSpan => {
        contacts.push(contactSpan.dataset.contact); 
    });
    return contacts;
}


/**
 * This function validates the task form inputs
 * 
 * @param {string} title - The task title
 * @param {string} dueDate - The task due date 
 * @param {string} category - The task category
 * @returns {boolean} True if the form is valid, false otherwise
 */
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


/**
 * This function displays an error notification
 * 
 * @param {string} message - The error message to display
 */
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