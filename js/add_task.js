let books = [
    {
      "title": "",
      "description": "",
      "assignedTo": [
        {
            "contacts": ""
        }
      ],
      "dueDate": "",
      "prio": "",
      "category": "",
      "subtasks": "",
    },
];


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
        errorMessage.textContent = 'Bitte füge einen Text hinzu';
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
        this.classList.add('input-error');
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'This field is required.';
    } else {
        this.classList.remove('input-error');
        errorMessage.style.display = 'none';
    }
}

function fieldRequiredDate() {
    let dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.onchange = updateDateColor;
        dateInput.ondblclick = setToday;
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
        this.classList.add('input-error');
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'This field is required.';
    } else {
        this.classList.remove('input-error');
        errorMessage.style.display = 'none';
    }
}

function updateDateColor() {
    this.style.color = this.value ? 'black' : '#D1D1D1';
}

function setToday() {
    this.value = new Date().toISOString().split('T')[0];
    updateDateColor.call(this);
}

function dropdownCategory() {
    const dropdown = document.querySelector('.customDropdown');
    const selectedOption = dropdown.querySelector('.selectedOption');
    const options = dropdown.querySelectorAll('.option');
    const errorMessage = createErrorMessage(dropdown);
    addDropdownListeners(dropdown, selectedOption, options, errorMessage);
    addDocumentListener(dropdown);
    addFormSubmitListener(selectedOption, dropdown, errorMessage);
}

function createErrorMessage(dropdown) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'errorMessage';
    errorMessage.textContent = 'This field is required';
    dropdown.appendChild(errorMessage);
    return errorMessage;
}

function addDropdownListeners(dropdown, selectedOption, options, errorMessage) {
    let isOpen = false;
    selectedOption.addEventListener('click', () => {
        if (!isOpen) {
            dropdown.classList.add('active');
            isOpen = true;
        }
    });
    options.forEach(option => {
        option.addEventListener('click', function() {
            updateSelectedOption(selectedOption, this.textContent);
            resetDropdownState(dropdown, errorMessage);
            dropdown.classList.remove('active');
            isOpen = false;
        });
    });
}

function updateSelectedOption(selectedOption, text) {
    selectedOption.innerHTML = `${text} <img id="dropDownImageCategory" src="./assets/img/arrow_drop_down.svg" onclick="toggleRotationDownImage()">`;
    selectedOption.style.color = 'black';
}

function resetDropdownState(dropdown, errorMessage) {
    dropdown.classList.remove('active', 'error');
    errorMessage.classList.remove('visible');
}


function addFormSubmitListener(selectedOption, dropdown, errorMessage) {
    document.querySelector('form').addEventListener('submit', function(e) {
        if (selectedOption.textContent === 'Select task category') {
            e.preventDefault();
            dropdown.classList.add('error');
            errorMessage.classList.add('visible');
        }
    });
}

document.addEventListener('DOMContentLoaded', dropdownCategory);

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
}

function getElements() {
    return {
        assignedTo: document.getElementById('assignedTo'),
        contactDropdown: document.getElementById('contactDropdown'),
        dropDownImage: document.getElementById('dropDownImageContacts'),
        contactsDisplay: document.getElementById('contacts')
    };
}

function setupEventListeners(elements) {
    let isOpen = false;
    elements.assignedTo.addEventListener('click', (event) => toggleDropdown(event, elements, isOpen));
}

function toggleDropdown(event, elements, isOpen) {
    event.stopPropagation();
    isOpen = !isOpen;
    elements.contactDropdown.classList.toggle('show', isOpen);
    elements.dropDownImage.classList.toggle('dropDownImageRotation180', isOpen);    
    if (isOpen) {
        document.addEventListener('click', preventClose);
    } else {
        document.removeEventListener('click', preventClose);
    }
}

function preventClose(event) {
    event.stopPropagation();
}

function selectContact(contact, elements) {
    elements.contactsDisplay.textContent = contact;
    elements.contactDropdown.classList.remove('show');
    elements.dropDownImage.classList.remove('dropDownImageRotation180');
    document.removeEventListener('click', preventClose);
}

function addContact(contact, contactDropdown) {
    const contactItem = document.createElement('div');
    contactItem.className = 'contactItem';
    contactItem.textContent = contact;
    contactItem.addEventListener('click', (event) => {
        event.stopPropagation();
        selectContact(contact, getElements());
    });
    contactDropdown.appendChild(contactItem);
}

function addExampleContacts(contactDropdown) {
    addContact('Max Mustermann', contactDropdown);
    addContact('Erika Musterfrau', contactDropdown);
    addContact('John Doe', contactDropdown);
}

document.addEventListener('DOMContentLoaded', initializeContactDropdown);

function createNewTask () {
    let title = document.getElementById('title').innerHTML.value;
    let description = document.getElementById('description').innerHTML.value;
    let contactDropdown = document.getElementById('contactDropdown').innerHTML.value;
    let date = document.getElementById('date').innerHTML.value;
    let prioUrgent = document.getElementById('prioUrgent').innerHTML;
    let prioMedium = document.getElementById('prioMedium').innerHTML;
    let prioLow = document.getElementById('prioLow').innerHTML;
    let technicalTask = document.getElementById('technicalTask').innerHTML;
    let userStory = document.getElementById('userStory').innerHTML;
    let subTaskList = document.getElementById('subTaskList').innerHTML.value;
    
   
    
}

// document.addEventListener('DOMContentLoaded', function() {
//     const dropdown = document.querySelector('.customDropdown');
//     const selectedOption = dropdown.querySelector('.selectedOption');
//     const options = dropdown.querySelectorAll('.option');
//     const errorMessage = document.createElement('div');
//     errorMessage.className = 'errorMessage';
//     errorMessage.textContent = 'This field is required';
//     dropdown.appendChild(errorMessage);

//     selectedOption.addEventListener('click', function() {
//         dropdown.classList.toggle('active');
//     });

//     options.forEach(option => {
//         option.addEventListener('click', function() {
//             selectedOption.textContent = this.textContent;
//             selectedOption.style.color = 'black';
//             dropdown.classList.remove('active');
//             dropdown.classList.remove('error');
//             errorMessage.classList.remove('visible');
//         });
//     });

//     document.addEventListener('click', function(e) {
//         if (!dropdown.contains(e.target)) {
//             dropdown.classList.remove('active');
//         }
//     });

//     document.querySelector('form').addEventListener('submit', function(e) {
//         if (selectedOption.textContent === 'Select task category') {
//             e.preventDefault();
//             dropdown.classList.add('error');
//             errorMessage.classList.add('visible');
//         }
//     });
// });

