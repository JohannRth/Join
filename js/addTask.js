// add_task.js

// Initialisierung der Arrays
let newTasks = [];
let subTasks = [];

// Liste der Farben für die Icons
let colors = [
    "#FF7A00",
    "#FF5EB3",
    "#6E52FF",
    "#9327FF",
    "#00BEE8",
    "#1FD7C1",
    "#FF745E",
    "#FFA35E",
    "#FC71FF",
    "#FFC701",
    "#0038FF",
    "#C3FF2B",
    "#FFE62B",
    "#FF4646",
    "#FFBB2B"
];


// Funktion zum Setzen der Priorität anpassen
function setPriority(priority) {
    document.querySelectorAll('.prioButtonUrgent, .prioButtonMedium, .prioButtonLow').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.prioButton${priority.charAt(0).toUpperCase() + priority.slice(1)}`).classList.add('active');
}

// Beim Laden der Seite den Medium-Button auswählen
document.addEventListener('DOMContentLoaded', function() {
    setPriority('medium');
});


function showinputSubTaksClickContainer() {
    let inputSubTaksClickContainer = document.getElementById('inputSubTaksClickContainer');
    let addSubTaskButton = document.getElementById('addSubTaskButton');
    let addSubTaskButtonContainer = document.querySelector('.addSubTaskButtonContainer');
    let subTaskInput = document.getElementById('subTaskInput');
    inputSubTaksClickContainer.classList.add('visible');
    addSubTaskButton.style.display = 'none';
    addSubTaskButtonContainer.classList.add('no-hover');
    subTaskInput.addEventListener('click', showinputSubTaksClickContainer);
}


function deleteCurrentText() {
    let inputSubTaksClickContainer = document.getElementById('inputSubTaksClickContainer');
    let addSubTaskButton = document.getElementById('addSubTaskButton');
    let addSubTaskButtonContainer = document.querySelector('.addSubTaskButtonContainer');
    let subTaskInput = document.getElementById('subTaskInput');
    subTaskInput.value = "";
    addSubTaskButton.style.display = 'block';
    inputSubTaksClickContainer.classList.remove('visible');
    addSubTaskButtonContainer.classList.remove('no-hover');
    subTaskInput.removeEventListener('click', showinputSubTaksClickContainer);
}


function addNewSubtask(event) {
    let newSubTask = document.getElementById('subTaskInput');
    if(newSubTask.value == 0) {
        return false;
    }
    subTasks.push(newSubTask.value);
    newSubTask.value = '';
    renderSubtasks();
    if (event && event.type === 'click') {
        document.getElementById('inputSubTaksClickContainer').classList.remove('visible');
        document.getElementById('addSubTaskButton').style.display = 'block';
        document.querySelector('.addSubTaskButtonContainer').classList.remove('no-hover');
    }
}


function hideInputSubTaksClickContainerOnOutsideClick() {
    document.addEventListener('click', function(event) {
        let inputSubTaksClickContainer = document.getElementById('inputSubTaksClickContainer');
        let addSubTaskButton = document.getElementById('addSubTaskButton');
        let addSubTaskButtonContainer = document.querySelector('.addSubTaskButtonContainer');
        let subTaskInput = document.getElementById('subTaskInput');
        if (!inputSubTaksClickContainer.contains(event.target) && 
            !subTaskInput.contains(event.target) &&
            !addSubTaskButton.contains(event.target)) {
            inputSubTaksClickContainer.classList.remove('visible');
            addSubTaskButton.style.display = 'block';
            addSubTaskButtonContainer.classList.remove('no-hover');
        }
    });
}


hideInputSubTaksClickContainerOnOutsideClick();


function renderSubtasks(editIndex = -1) {
    let subTaskList = document.getElementById('subTaskList');
    subTaskList.innerHTML = '';
    subTasks.forEach((subTask, index) => {
        if (index === editIndex) {
            subTaskList.innerHTML += subtaskInProgressTemplate(index, subTask);
        } else {
            subTaskList.innerHTML += subTaskCreatedTemplate(index, subTask);
        }
    });
}


function editSubTask(index) {
    renderSubtasks(index);
}


function saveSubTask(index) {
    let editedText = document.getElementById(`editInput${index}`).value;
    if (editedText.trim() !== '') {
        subTasks[index] = editedText;
    }
    renderSubtasks();
}


function deleteSubTask(index) {
    subTasks.splice(index, 1);
    renderSubtasks();
}


function fieldRequiredTitle() {
    let titleInput = document.getElementById('title');
    if (titleInput) {
        titleInput.onfocus = validateTitleField;
        titleInput.oninput = validateTitleField;
        titleInput.onblur = validateTitleField;
        validateTitleField.call(titleInput); 
    }
}


function validateTitleField() {
    let errorMessage = this.nextElementSibling;
    if (!this.value) {
        this.classList.add('inputError');
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'This field is required';
    } else {
        this.classList.remove('inputError');
        errorMessage.style.display = 'none';
    }
}


function fieldRequiredDate() {
    let dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.onchange = updateDateColor;
        dateInput.onfocus = validateDateField;
        dateInput.oninput = validateDateField;
        dateInput.onblur = validateDateField;
        updateDateColor.call(dateInput);
        validateDateField.call(dateInput);
    }
}


function validateDateField() {
    let errorMessage = this.nextElementSibling;
    if (!this.value) {
        this.classList.add('inputError');
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'This field is required';
    } else {
        this.classList.remove('inputError');
        errorMessage.style.display = 'none';
    }
}


function fieldRequiredCategory() {
    let categorySelector = document.getElementById('categorySelector');
    let dropdownContent = document.getElementById('categoryDropdown');
    if (categorySelector && dropdownContent) {
        categorySelector.onclick = function() {
            let errorMessage = this.querySelector('.errorMessage');
            this.classList.remove('inputError');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        };
        validateCategoryField.call(categorySelector);
    }
}


function validateCategoryField() {
    let selectedCategory = this.querySelector('.selectedCategoryHeadline');
    let errorMessage = this.querySelector('.errorMessage');
    if (selectedCategory.textContent === 'Select task category') {
        this.classList.add('inputError');
        if (errorMessage) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'This field is required';
        }
    }
}


function getDateToday() {
    let dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
        dateInput.onclick = function() {
            if (this.value === "YYYY-MM-DD") {
                this.value = new Date().toISOString().split('T')[0];
            }
            updateDateColor.call(this);
        };
        dateInput.onchange = function() {
            validateDate(this);
            updateDateColor.call(this);
        };
    }
}


function validateDate(input) {
    let selectedDate = new Date(input.value);
    let currentDate = new Date();
    let maxYear = 2999;
    if (selectedDate < currentDate) {
        input.value = currentDate.toISOString().split('T')[0];
    } else if (selectedDate.getFullYear() > maxYear) {
        input.value = `${maxYear}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    }
}


function updateDateColor() {
    this.style.color = this.value && this.value !== "YYYY-MM-DD" ? 'black' : '#D1D1D1';
}


let categoryDropdownInitialized = false;


function initializeCategoryDropdown() {
    if (categoryDropdownInitialized) return;
    let elements = getCategoryElements();
    setupCategoryEventListeners(elements);
    addCategoryOptions(elements.categoryDropdown);
    categoryDropdownInitialized = true;
    document.addEventListener('click', (event) => {
        if (!elements.categorySelector.contains(event.target) && !elements.categoryDropdown.contains(event.target)) {
            closeCategoryDropdown(elements);
        }
    });
}


function getCategoryElements() {
    return {
        categorySelector: document.getElementById('categorySelector'),
        categoryDropdown: document.getElementById('categoryDropdown'),
        dropDownImage: document.getElementById('dropDownImageCategory'),
        selectedCategory: document.getElementById('selectedCategory')
    };
}


function setupCategoryEventListeners(elements) {
    elements.categorySelector.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleCategoryDropdown(elements);
    });
}


function toggleCategoryDropdown(elements) {
    const isOpen = elements.categoryDropdown.classList.toggle('show');
    elements.dropDownImage.classList.toggle('dropDownImageRotation180', isOpen);
}


function closeCategoryDropdown(elements) {
    elements.categoryDropdown.classList.remove('show');
    elements.dropDownImage.classList.remove('dropDownImageRotation180');
}


function selectCategory(category, elements) {
    elements.selectedCategory.textContent = category;
    closeCategoryDropdown(elements);
}


function addCategoryOption(category, categoryDropdown) {
    let categoryItem = document.createElement('div');
    categoryItem.className = 'categoryItem';
    categoryItem.textContent = category;
    categoryItem.addEventListener('click', (event) => {
        event.stopPropagation();
        selectCategory(category, getCategoryElements());
    });
    categoryDropdown.appendChild(categoryItem);
}


function addCategoryOptions(categoryDropdown) {
    addCategoryOption('Technical Task', categoryDropdown);
    addCategoryOption('User Story', categoryDropdown);
}


document.addEventListener('DOMContentLoaded', initializeCategoryDropdown);


let isDropdownOpen = false;


function toggleRotationDownImage() {
    let downImage = document.getElementById('dropDownImageCategory');
    downImage.classList.add('dropDownImageRotation180');
}


let contactDropdownInitialized = false;


function initializeContactDropdown() {
    if (contactDropdownInitialized) return;
    let elements = getElements();
    setupEventListeners(elements);
    addExampleContacts(elements.contactDropdown);
    contactDropdownInitialized = true;
    document.addEventListener('click', (event) => {
        if (!elements.assignedTo.contains(event.target) && !elements.contactDropdown.contains(event.target)) {
            closeDropdown(elements);
        }
    });
}

function toggleContactDropdown() {
    activeContacts = document.getElementById('aktivContacts').add.classList('displayNone');

}


function getElements() {
    return {
        assignedTo: document.getElementById('assignedTo'),
        contactDropdown: document.getElementById('contactDropdown'),
        dropDownImage: document.getElementById('dropDownImageContacts'),
    };
}


function setupEventListeners(elements) {
    elements.assignedTo.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleDropdown(elements);
    });
}


function toggleDropdown(elements) {
    let isOpen = elements.contactDropdown.classList.toggle('show');
    elements.dropDownImage.classList.toggle('dropDownImageRotation180', isOpen);
}


function closeDropdown(elements) {
    elements.contactDropdown.classList.remove('show');
    elements.dropDownImage.classList.remove('dropDownImageRotation180');
}


function preventClose(event) {
    event.stopPropagation();
}



function selectContact(contact) {
    let contactItem = Event.target.closest('.contactItem');
    let checkbox = contactItem.querySelector('.contactCheckbox');
    checkbox.checked = !checkbox.checked;
    updateActiveContacts(contact, checkbox.checked);
}


function updateActiveContacts(contact, isChecked) {
    let activeContactsDiv = document.getElementById('aktivContacts');
    if (isChecked) {
        let contactElement = document.createElement('div');
        contactElement.textContent = contact;
        contactElement.setAttribute('data-contact', contact);
        activeContactsDiv.appendChild(contactElement);
    } else {
        let existingContact = activeContactsDiv.querySelector(`[data-contact="${contact}"]`);
        if (existingContact) {
            existingContact.remove();
        }
    }
}

function addContact(contact, contactDropdown) {
    let contactItem = document.createElement('div');
    contactItem.className = 'contactItem';
    contactItem.innerHTML = addContactTemplate(contact);
    let checkbox = contactItem.querySelector('.contactCheckbox');
    contactItem.addEventListener('click', (event) => {
        if (event.target !== checkbox) {
            event.preventDefault();
            toggleContactState(contactItem, checkbox, contact);
        }
    });
    checkbox.addEventListener('change', () => {
        toggleContactState(contactItem, checkbox, contact);
    });
    sortContactAlphabetically(contactDropdown, contactItem);
}


function sortContactAlphabetically(container, newItem) {
    let contactName = newItem.querySelector('.contactName').textContent;
    let items = container.querySelectorAll('.contactItem');
    let insertIndex = Array.from(items).findIndex(item => 
        item.querySelector('.contactName').textContent.localeCompare(contactName) > 0
    );
    if (insertIndex === -1) {
        container.appendChild(newItem);
    } else {
        container.insertBefore(newItem, items[insertIndex]);
    }
}


function toggleContactState(contactItem, checkbox, contact) {
    contactItem.classList.toggle('active');
    checkbox.checked = contactItem.classList.contains('active');
    if (contactItem.classList.contains('active')) {
        addToActiveContacts(contact);
    } else {
        removeFromActiveContacts(contact);
    }
}


function updateAktivContactsVisibility() {
    const aktivContacts = document.getElementById('aktivContacts');
    aktivContacts.style.display = aktivContacts.children.length > 0 ? 'flex' : 'none';
}


function addToActiveContacts(contact) {
    let aktivContacts = document.getElementById('aktivContacts');
    let contactElement = document.createElement('span');
    contactElement.className = 'contactIcon';
    contactElement.style.backgroundColor = getColor(contact);
    contactElement.textContent = getInitials(contact);
    contactElement.setAttribute('data-contact', contact);
    aktivContacts.appendChild(contactElement);
    updateAktivContactsVisibility();
}

function removeFromActiveContacts(contact) {
    let aktivContacts = document.getElementById('aktivContacts');
    let contactElement = aktivContacts.querySelector(`[data-contact="${contact}"]`);
    if (contactElement) {
        aktivContacts.removeChild(contactElement);
    }
    updateAktivContactsVisibility();
}

// Funktion zum Erhalten der Initialen des Namens
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    let nameParts = name.trim().split(' ');
    let initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; 
    let firstLetter = name.charAt(0).toUpperCase();
    let index = firstLetter.charCodeAt(0) - 65;
    return colors[index % colors.length];
}


async function initializeContactDropdown() {
    if (contactDropdownInitialized) return;
    let elements = getElements();
    setupEventListeners(elements);
    await loadAndAddContacts(elements.contactDropdown);
    contactDropdownInitialized = true;
    document.addEventListener('click', (event) => {
        if (!elements.assignedTo.contains(event.target) && !elements.contactDropdown.contains(event.target)) {
            closeDropdown(elements);
        }
    });
    updateAktivContactsVisibility();
}


async function loadAndAddContacts(contactDropdown) {
    try {
        const contacts = await loadData('contacts');
        Object.values(contacts).forEach(contact => {
            addContact(contact.name, contactDropdown);
        });
    } catch (error) {
        console.error('Fehler beim Laden der Kontakte:', error);
        addExampleContacts(contactDropdown);
    }
}


document.addEventListener('DOMContentLoaded', initializeContactDropdown);

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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Funktion zum Zurücksetzen des Formulars
function resetFormFields() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('contacts').textContent = 'Select contacts to assign';
    document.getElementById('date').value = '';
    document.querySelectorAll('.prioButtonUrgent, .prioButtonMedium, .prioButtonLow').forEach(btn => {btn.classList.remove('active');});
    document.getElementById('selectedCategory').textContent = 'Select task category';
    document.getElementById('subTaskList').innerHTML = '';
    document.getElementById('subTaskInput').value = '';
    document.getElementById('aktivContacts').innerHTML = '';
    document.querySelectorAll('.contactItem').forEach(item => {
        item.classList.remove('active');
        let checkbox = item.querySelector('.contactCheckbox');
        if (checkbox) {checkbox.checked = false;}
    });
}

function resetNewTask() {
    resetFormFields();
    setPriority('medium');
    updateAktivContactsVisibility();
}

function showTaskAddedNotification() {
    let notification = document.getElementById('taskAddedNotification');
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      window.location.href = 'board.html';
    }, 3000);
  }

