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

document.addEventListener('DOMContentLoaded', function() {
    let addSubTaskButton = document.getElementById('addSubTaskButton');
    let subTaskInput = document.getElementById('subTaskInput');
    let subTaskList = document.getElementById('subTaskList');

    addSubTaskButton.addEventListener('click', addSubTask);

    function addSubTask() {
        let subTaskText = subTaskInput.value.trim();
        if (subTaskText) {
            subTasks.push(subTaskText);
            subTaskInput.value = '';
            renderSubTasks();
        }
    }

    function renderSubTasks() {
        subTaskList.innerHTML = '';
        subTasks.forEach((subTask, index) => {
            const subTaskElement = document.createElement('div');
            subTaskElement.className = 'subTask';
            subTaskElement.innerHTML = `
                <span>${subTask}</span>
                <button onclick="editSubTask(${index})">Edit</button>
                <button onclick="deleteSubTask(${index})">Delete</button>
            `;
            subTaskList.appendChild(subTaskElement);
        });
    }

    window.editSubTask = function(index) {
        const newText = prompt('Edit subTask:', subTasks[index]);
        if (newText !== null) {
            subTasks[index] = newText.trim();
            renderSubTasks();
        }
    }

    window.deleteSubTask = function(index) {
        subTasks.splice(index, 1);
        renderSubTasks();
    }
});