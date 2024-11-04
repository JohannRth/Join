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

/**
 * 
 * 
 */
function init() {
    setPriority('medium');
    initializeDatePicker();
    initializeContactDropdown();
    initializeCategoryDropdown();
    hideInputSubTaksClickContainerOnOutsideClick();
}

/**
 * This function sets the button to activated
 * 
 * @param {string} priority -
 */
function setPriority(priority) {
    document.querySelectorAll('.prioButtonUrgent, .prioButtonMedium, .prioButtonLow').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.prioButton${priority.charAt(0).toUpperCase() + priority.slice(1)}`).classList.add('active');
} 


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


function initializeDatePicker() {
    let dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('click', function(e) {
            let rect = this.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            if (clickX > rect.width - 30) {
                e.preventDefault();
                this.showPicker();
            }
        });
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

  init();

