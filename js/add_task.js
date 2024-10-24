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
        this.classList.add('inputError');
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'This field is required.';
    } else {
        this.classList.remove('inputError');
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
        this.classList.add('inputError');
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'This field is required.';
    } else {
        this.classList.remove('inputError');
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
        contactsDisplay: document.getElementById('contacts')
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

function createNewTask() {
    let category = getCategory();
    if (category === '') {
        let dropdown = document.querySelector('.customDropdown');
        let errorMessage = dropdown.querySelector('.errorMessage');
        dropdown.classList.add('error');
        errorMessage.classList.add('visible');
        return;
    }

    let newTask = {
        "title": document.getElementById('title').value,
        "description": document.getElementById('description').value,
        "assignedTo": [{
            "contacts": document.getElementById('contacts').textContent
        }],
        "dueDate": document.getElementById('date').value,
        "prio": getPriority(),
        "category": category,
        "subtasks": getSubtasks(),
    };
    newTasks.push(newTask);
    resetNewTask();
}

function getPriority() {
    if (document.querySelector('.prioButtonUrgent.active')) return 'urgent';
    if (document.querySelector('.prioButtonMedium.active')) return 'medium';
    if (document.querySelector('.prioButtonLow.active')) return 'low';
    return '';
}

function getCategory() {
    let selectedOption = document.querySelector('.selectedOption div').textContent;
    return selectedOption !== 'Select task category' ? selectedOption : '';
}

function getSubtasks() {
    let subtaskElements = document.querySelectorAll('#subTaskList .subtask');
    return Array.from(subtaskElements).map(el => el.textContent);
}

function resetNewTask() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('contacts').textContent = 'Select contacts to assign';
    document.getElementById('date').value = '';
    
    document.querySelectorAll('.prioButtonUrgent, .prioButtonMedium, .prioButtonLow').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector('.selectedOption div').textContent = 'Select task category';
    
    document.getElementById('subTaskList').innerHTML = '';
    document.getElementById('subTaskInput').value = '';

}
