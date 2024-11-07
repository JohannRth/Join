/**
 * This function generates a contact template for display
 * 
 * @param {string} contact - The name of the contact
 * @param {string} loggedInUserPlusYou - The Text (You) after the name of the contact
 * @returns {string} HTML template for the contact
 */
function addContactTemplate(contact, loggedInUserPlusYou = '') {
    return `
        <div class="contactIconAndName">
            <div class="contactIcon" style="background-color: ${getColor(contact)};">
                ${getInitials(contact)}
            </div>
            <div>
                <span class="contactName">${contact}${loggedInUserPlusYou}</span>
            </div>
        </div>
        <div>
            <input type="checkbox" class="contactCheckbox">
        </div>
    `;
}


/**
 * This function creates a template for a subtask in progress (editing mode)
 * 
 * @param {number} index - The index of the subtask
 * @param {string} subTask - The content of the subtask
 * @returns {string} HTML template for the subtask in editing mode
 */
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


/**
 * This function generates a template for a created subtask
 * 
 * @param {number} index - The index of the subtask
 * @param {string} subTask - The content of the subtask
 * @returns {string} HTML template for the created subtas
 */
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