function addContactTemplate(contact) {
    return `
        <div class="contactIconAndName">
            <div class="contactIcon" style="background-color: ${getColor(contact)};">
                ${getInitials(contact)}
            </div>
            <div>
                <span class="contactName">${contact}</span>
            </div>
        </div>
        <div>
            <input type="checkbox" class="contactCheckbox">
        </div>
    `;
}

function subtaskInProgressTemplate(index, subTask) {
    return `
                <div class="subTaskEdit">
                    <div class="leftContainerSubTask">
                        <input type="text" id="editInput${index}" value="${subTask}" class="subTaskEditInput">
                    </div>
                    <div class="rightContainerSubTask">
                        <div>
                            <img class="subTaskDeleteButton" onclick="deleteSubTask(${index})" src="./assets/img/delete.svg" alt="Delete">
                        </div>
                        <div class="partingLine"></div>
                        <div>
                            <img class="subTaskSaveButton" onclick="saveSubTask(${index})" src="./assets/img/check-dark.svg" alt="Save">
                        </div>
                    </div>
                </div>
            `;
}

function subTaskCreatedTemplate(index, subTask) {
    return `
        <div class="subTask" ondblclick="editSubTask(${index})">
            <div class="leftContainerSubTask">
                <ul class="subTaskListContainer">
                    <li class="listSubTask"><span>${subTask}</span></li>
                </ul>
            </div>
            <div class="rightContainerSubTask">
                <div class="subTaskButtons">
                    <img class="subTaskEditButton" onclick="editSubTask(${index})" src="./assets/img/edit.svg" alt="Edit">
                    <div class="partingLine"></div>
                    <img class="subTaskDeleteButton" onclick="deleteSubTask(${index})" src="./assets/img/delete.svg" alt="Delete">
                </div>
            </div>
        </div>
    `;
}