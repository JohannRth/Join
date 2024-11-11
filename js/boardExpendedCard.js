function generateExpandedCardHTML(element) {
    const taskTypeStyle = element.type === "Technical Task"
        ? `height: 36px; width: 208px; border-radius: 8px; padding: 4px 16px; background-color: #1FD7C1; color: #FFFFFF; font-size: 23px; font-weight: 400;`
        : `width: 164px; height: 36px; border-radius: 8px; padding: 4px 16px; background-color: #0038ff; color: white; font-weight: 400; font-size: 23px; display: flex; align-items: center; justify-content: center;`;

    let priorityLabel = "";
    let priorityIconSrc = "";
    if (element.priority === "urgent") {
        priorityLabel = "Urgent";
        priorityIconSrc = "./assets/img/urgent-titel-card.svg";
    } else if (element.priority === "medium") {
        priorityLabel = "Medium";
        priorityIconSrc = "./assets/img/medium-titel-card.svg";
    } else if (element.priority === "low") {
        priorityLabel = "Low";
        priorityIconSrc = "./assets/img/low-titel-card.svg";
    } else {
        priorityLabel = "Default";
        priorityIconSrc = "./assets/img/default-titel-card.svg";
    }

    const dueDate = element.dueDate ? new Date(element.dueDate).toLocaleDateString("de-DE") : "Kein Datum";

    const subtasksHTML = element.subtasks.map((subtask, index) => `
    <div class="subtask-item" style="display: flex; align-items: center; gap: 16px;">
        <input type="checkbox" 
               id="subtask-checkbox-${element.id}-${index}" 
               onclick="toggleSubtask('${element.id}', ${index})" 
               class="styled-checkbox"
               ${subtask.completed ? "checked" : ""}>
        <label for="subtask-checkbox-${element.id}-${index}">${subtask.title}</label>
    </div>
    `).join('');

    return `
    <div class="around-container-epended-card">    
      <div class="expanded-card-overlay">
        <div class="close-story-container-overlay">
            <div class="user-story-overlay" style="${taskTypeStyle}">${element["type"]}</div>
            <img src="./assets/img/close.svg" alt="close" class="close-btn-overlay" onclick="closeCardOverlay()">
        </div>
        <div class="task-title-overlay">${element["titel"]}</div>
        <div class="task-description-overlay">${element["description"]}</div>
        <div class="due-date-overlay">
            <span class="date-line-overlay">Due date:</span>
            <span class="date-date-overlay">${dueDate}</span>
        </div>
        <div class="priority-container-overlay">
            <span class="priority-line-overlay">Priority:</span>
            <div class="priority-focus-img-container">
                <span class="priority-focus-overlay">${priorityLabel}</span>
                <img src="${priorityIconSrc}" alt="Priority ${priorityLabel}" class="priority-img-overlay">
            </div>    
        </div>
        <span class="task-assigned-line-overlay">Assigned To:</span>
        <div class="task-assigned-container-overlay">
                ${element.contacts.map(contact => `
                <div class="person-container-overlay">
                    <span class="person-circle-overlay" style="background-color: ${getColor(contact)};">${getInitials(contact)}</span>
                    <span class="person-name-overlay">${contact}</span>
                </div>
            `).join('')}
        </div>
        <div class="subtask-conatiner-overlay">
            <span class="subtask-line-overlay">Subtasks:</span>
            <div class="subtasks-box-overlay">
                ${subtasksHTML}
            </div>
        </div>
         <div class="actions-overlay">
            <p class="action-btn-overlay" onclick="deleteTask('${element.id}')">
                <img src="./assets/img/delete.svg" alt="delete">Delete
            </p>
            <img src="./assets/img/sep-delet-edit.svg" alt="delete">
            <p class="action-btn-overlay" onclick="openEditOverlay('${element.id}')">
                <img src="./assets/img/edit.svg" alt="edit">Edit
            </p>
        </div>
      </div>
    </div> `;
}

async function toggleSubtask(taskId, subtaskIndex) {
    const task = todos.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
        console.error("Subtask nicht gefunden oder ungültiger Index:", taskId, subtaskIndex);
        return;
    }

 
    const subtask = task.subtasks[subtaskIndex];
    subtask.completed = !subtask.completed;

    await saveSubtaskStatus(taskId, subtaskIndex, subtask.completed);

    task.completedSubtasks = task.subtasks.filter(st => st.completed).length;

    const totalSubtasks = task.subtasks.length;
    const percentage = totalSubtasks > 0 ? (task.completedSubtasks / totalSubtasks) * 100 : 0;

    updateProgressBar(taskId, percentage, task.completedSubtasks, totalSubtasks);
}

async function saveSubtaskStatus(taskId, subtaskIndex, isChecked) {
    const path = `subtaskStatus/${taskId}/${subtaskIndex}`;
    console.log(`Speichere Subtask-Status an Pfad ${path}:`, isChecked);
    await updateData(path, { completed: isChecked });
}

async function loadSubtaskStatusesFromFirebase() {
    const subtaskStatuses = await loadData("subtaskStatus");

    todos.forEach(task => {
        if (subtaskStatuses[task.id]) {
            task.subtasks.forEach((subtask, index) => {
                if (subtaskStatuses[task.id][index] && subtaskStatuses[task.id][index].completed !== undefined) {
                    subtask.completed = subtaskStatuses[task.id][index].completed || false;
                } else {
                    subtask.completed = false; 
                }
            });
        }
    });
}

function updateProgressBar(taskId) {
    const task = todos.find((t) => t.id === taskId);
    if (!task) return;

    const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
    const totalSubtasks = task.subtasks.length;
    const percentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const taskElement = document.getElementById(taskId);
    if (!taskElement) return;

    const progressBar = taskElement.querySelector(".progress-fill");
    const progressText = taskElement.querySelector(".progress-text");

    if (progressBar && progressText) {
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
    }
}

function openCardOverlay(taskId) {
    const overlay = document.getElementById("card-overlay");
    const task = todos.find((t) => t.id === taskId); 
    overlay.innerHTML = generateExpandedCardHTML(task);
    overlay.classList.remove("hidden");

    document.body.classList.add("no-scroll");

    const deleteButton = overlay.querySelector(".action-btn-overlay");
    deleteButton.setAttribute("onclick", `deleteTask('${taskId}')`);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            closeCardOverlay();
        }
    });
}

function closeCardOverlay() {
    const overlay = document.getElementById("card-overlay");
    overlay.classList.add("hidden");

    document.body.classList.remove("no-scroll");
}

async function deleteTask(taskId) {
    todos = todos.filter(task => task.id !== taskId);

    const taskPath = `tasks/${taskId}`;
    const subtaskStatusPath = `subtaskStatus/${taskId}`;
    const positionPath = `positionDropArea/${taskId}`;
    
    try {
        await deleteData(taskPath);
        console.log(`Task mit ID ${taskId} wurde erfolgreich in Firebase gelöscht.`);
        
        await deleteData(subtaskStatusPath);
        console.log(`Subtask-Status für Task ${taskId} wurde erfolgreich in Firebase gelöscht.`);
        
        await deleteData(positionPath);
        console.log(`Position für Task ${taskId} wurde erfolgreich in Firebase gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen der Daten aus Firebase:", error);
        return; 
    }

    updateHTML();
    closeCardOverlay(); 
}

async function deleteData(path) {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Fehler beim Löschen der Daten aus Firebase: ${response.statusText}`);
        }
        console.log(`Daten bei Pfad ${path} wurden erfolgreich gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen der Daten aus Firebase:", error);
    }
}
