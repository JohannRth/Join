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

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.querySelector('.inputAddTaskDueDate');
    const titleInput = document.querySelector('#title');
    
    if (dateInput) {
        dateInput.addEventListener('change', updateDateColor);
        dateInput.addEventListener('dblclick', setToday);
        dateInput.addEventListener('focus', validateField);
        dateInput.addEventListener('input', validateField);
        updateDateColor.call(dateInput);
    }
    
    if (titleInput) {
        titleInput.addEventListener('focus', validateField);
        titleInput.addEventListener('input', validateField);
    }
});

function updateDateColor() {
    this.style.color = this.value ? 'black' : '#D1D1D1';
}

function setToday() {
    this.value = new Date().toISOString().split('T')[0];
    updateDateColor.call(this);
}

function validateField() {
    const errorMessage = this.nextElementSibling;
    if (!this.value) {
        this.classList.add('input-error');
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'This field is required.';
    } else {
        this.classList.remove('input-error');
        errorMessage.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.customDropdown');
    const selectedOption = dropdown.querySelector('.selectedOption');
    const options = dropdown.querySelectorAll('.option');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'errorMessage';
    errorMessage.textContent = 'This field is required';
    dropdown.appendChild(errorMessage);

    selectedOption.addEventListener('click', function() {
        dropdown.classList.toggle('active');
    });

    options.forEach(option => {
        option.addEventListener('click', function() {
            selectedOption.textContent = this.textContent;
            selectedOption.style.color = 'black';
            dropdown.classList.remove('active');
            dropdown.classList.remove('error');
            errorMessage.classList.remove('visible');
        });
    });

    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    document.querySelector('form').addEventListener('submit', function(e) {
        if (selectedOption.textContent === 'Select task category') {
            e.preventDefault();
            dropdown.classList.add('error');
            errorMessage.classList.add('visible');
        }
    });
});

