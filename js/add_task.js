// let newTasks = [
//     {
//       "title": "",
//       "description": "",
//       "assignedTo": [
//         {
//             "contacts": ""
//         }
//       ],
//       "dueDate": "",
//       "prio": "",
//       "category": "",
//       "subtasks": "",
//     },
// ];


let newTasks = []; // Definition der newTasks-Array

let subTasks = [];

function setPriority(priority) {
    let buttons = document.querySelectorAll('.prioButtonUrgent, .prioButtonMedium, .prioButtonLow');
    let selectedButton = document.querySelector(`.prioButton${priority.charAt(0).toUpperCase() + priority.slice(1)}`);
    if (selectedButton.classList.contains('active')) {
        selectedButton.classList.remove('active');
    } else {
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        selectedButton.classList.add('active');
    }
}

function addNewSubtask() {
    let newSubTask = document.getElementById('subTaskInput');
    let errorMessage = document.getElementById('subTaskErrorMessage');
    if(newSubTask.value == 0) {
        errorMessage.textContent = 'Please add a text';
        errorMessage.classList.add('visible');
        return false;
    }
    errorMessage.classList.remove('visible');
    subTasks.push(newSubTask.value);
    newSubTask.value = '';
    renderSubtasks();
}

function renderSubtasks(editIndex = -1) {
    let subTaskList = document.getElementById('subTaskList');
    subTaskList.innerHTML = '';
    subTasks.forEach((subTask, index) => {
        if (index === editIndex) {
            subTaskList.innerHTML += `
                <div class="subTaskEdit">
                    <div class="leftContainerSubTask">
                        <input type="text" id="editInput${index}" value="${subTask}" class="subTaskEditInput">
                    </div>
                    <div class="rightContainerSubTask">
                        <div>
                            <img class="subTaskSaveButton" onclick="saveSubTask(${index})" src="./assets/img/check-dark.svg" alt="Save">
                        </div>
                        <div class="partingLine"></div>
                        <div>
                            <img class="subTaskDeleteButton" onclick="deleteSubTask(${index})" src="./assets/img/delete.svg" alt="Delete">
                        </div>
                    </div>
                </div>
            `;
        } else {
            subTaskList.innerHTML += `
                <div class="subTask" ondblclick="editSubTask(${index})">
                    <div class="leftContainerSubTask">
                        <span>${subTask}</span>
                    </div>
                    <div class="rightContainerSubTask">
                        <div>
                            <img class="subTaskEditButton" onclick="editSubTask(${index})" src="./assets/img/edit.svg" alt="Edit">
                        </div>
                        <div class="partingLine"></div>
                        <div>
                            <img class="subTaskDeleteButton" onclick="deleteSubTask(${index})" src="./assets/img/delete.svg" alt="Delete">
                        </div>
                    </div>
                </div>
            `;
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
        dateInput.onclick = function() {
            if (this.value === "YYYY-MM-DD") {
                this.value = new Date().toISOString().split('T')[0];
            }
            updateDateColor.call(this);
        };
        dateInput.onchange = function() {
            updateDateColor.call(this);
        };
    }
}

function updateDateColor() {
    this.style.color = this.value && this.value !== "YYYY-MM-DD" ? 'black' : '#D1D1D1';
}


let categoryDropdownInitialized = false;

function initializeCategoryDropdown() {
    if (categoryDropdownInitialized) return;
    const elements = getCategoryElements();
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
    const categoryItem = document.createElement('div');
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
    const elements = getElements();
    setupEventListeners(elements);
    addExampleContacts(elements.contactDropdown);
    contactDropdownInitialized = true;
    document.addEventListener('click', (event) => {
        if (!elements.assignedTo.contains(event.target) && !elements.contactDropdown.contains(event.target)) {
            closeDropdown(elements);
        }
    });
}

function getElements() {
    return {
        assignedTo: document.getElementById('assignedTo'),
        contactDropdown: document.getElementById('contactDropdown'),
        dropDownImage: document.getElementById('dropDownImageContacts'),
        // contactsDisplay: document.getElementById('contacts')  // Fügt die Namen der Kontakte in den div ein
    };
}

function setupEventListeners(elements) {
    elements.assignedTo.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleDropdown(elements);
    });
}

function toggleDropdown(elements) {
    const isOpen = elements.contactDropdown.classList.toggle('show');
    elements.dropDownImage.classList.toggle('dropDownImageRotation180', isOpen);
}

function closeDropdown(elements) {
    elements.contactDropdown.classList.remove('show');
    elements.dropDownImage.classList.remove('dropDownImageRotation180');
}

function preventClose(event) {
    event.stopPropagation();
}

function selectContact(contact, elements) {
    const contactItem = event.target.closest('.contactItem');
    const checkbox = contactItem.querySelector('.contactCheckbox');
    // Toggle checkbox
    checkbox.checked = !checkbox.checked;
    
    // Update active contacts
    updateActiveContacts(contact, checkbox.checked);
}

function updateActiveContacts(contact, isChecked) {
    const activeContactsDiv = document.getElementById('aktivContacts');
    
    if (isChecked) {
        // Add contact to aktivContacts
        const contactElement = document.createElement('div');
        contactElement.textContent = contact;
        contactElement.setAttribute('data-contact', contact);
        activeContactsDiv.appendChild(contactElement);
    } else {
        // Remove contact from aktivContacts
        const existingContact = activeContactsDiv.querySelector(`[data-contact="${contact}"]`);
        if (existingContact) {
            existingContact.remove();
        }
    }
}
// function selectContact(contact, elements) {
//     // elements.contactsDisplay.textContent = contact;
//     // elements.contactDropdown.classList.remove('show'); // lässt beim anklicken des Kontaktes das DropDownMenü schließen.
//     elements.dropDownImage.classList.remove('dropDownImageRotation180');
//     document.removeEventListener('click', preventClose);
// }

function addContact(contact, contactDropdown) {
    let contactItem = document.createElement('div');
    contactItem.className = 'contactItem';
    contactItem.innerHTML = `
        <div class="contactIconAndName">
            <div class="contactIcon" style="background-color: ${getColor(contact)};">
                ${getInitials(contact)}
            </div>
            <div>
                <span>${contact}</span>
            </div>
        </div>
        <div>
            <input type="checkbox" class="contactCheckbox">
        </div>
    `;
    
    const checkbox = contactItem.querySelector('.contactCheckbox');
    
    contactItem.addEventListener('click', (event) => {
        if (event.target !== checkbox) {
            event.preventDefault();
            toggleContactState(contactItem, checkbox, contact);
        }
    });
    
    checkbox.addEventListener('change', () => {
        toggleContactState(contactItem, checkbox, contact);
    });
    
    contactDropdown.appendChild(contactItem);
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

function addToActiveContacts(contact) {
    const aktivContacts = document.querySelector('.aktivContacts');
    const contactElement = document.createElement('div');
    contactElement.textContent = contact;
    aktivContacts.appendChild(contactElement);
}

function removeFromActiveContacts(contact) {
    const aktivContacts = document.querySelector('.aktivContacts');
    const contactElements = aktivContacts.querySelectorAll('div');
    contactElements.forEach(element => {
        if (element.textContent === contact) {
            aktivContacts.removeChild(element);
        }
    });
}


// Liste der Farben für die Icons
const colors = [
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

// Funktion zum Erhalten der Initialen des Namens
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    const nameParts = name.trim().split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; // Standardfarbe
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
}

async function initializeContactDropdown() {
    if (contactDropdownInitialized) return;
    const elements = getElements();
    setupEventListeners(elements);
    await loadAndAddContacts(elements.contactDropdown);
    contactDropdownInitialized = true;
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


function createNewTask() {
    let title = document.getElementById('title').value;
    let dueDate = document.getElementById('date').value;
    let category = document.getElementById('selectedCategory').textContent;
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
    if (isValid) {
        // Hier fügen wir den Code ein, um die Aufgabe tatsächlich zu erstellen
        console.log("Neue Aufgabe erstellt!");
        showTaskAddedNotification();
    }
}

function resetNewTask() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('contacts').textContent = 'Select contacts to assign';
    document.getElementById('date').value = '';
    document.querySelectorAll('.prioButtonUrgent, .prioButtonMedium, .prioButtonLow').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('selectedCategory').textContent = 'Select task category';
    document.getElementById('subTaskList').innerHTML = '';
    document.getElementById('subTaskInput').value = '';
    document.getElementById('aktivContacts').innerHTML = '';

}

function showTaskAddedNotification() {
    const notification = document.getElementById('taskAddedNotification');
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

