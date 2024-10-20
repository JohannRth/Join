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
                <div class="subTask">
                    <div class="leftContainerSubTask">
                        <input type="text" id="editInput${index}" value="${subTask}" class="subTaskEditInput">
                    </div>
                    <div class="rightContainerSubTask">
                        <div>
                            <img class="subTaskSaveButton" onclick="saveSubTask(${index})" src="./assets/img/check.svg" alt="Save">
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
                <div class="subTask">
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
