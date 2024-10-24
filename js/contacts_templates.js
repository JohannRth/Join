function getContactModalHTML(contact, isEditMode, contactIndex, initials, color) {
    return `
        <div class="add-contact-modal-content">
            <div class="add-contact-left">
                <img class="modal-logo" src="./assets/img/join_logo_white.svg" alt="Join Logo">
                <h2>${isEditMode ? 'Edit contact' : 'Add contact'}</h2>
                <p>${isEditMode ? '' : 'Tasks are better with a team!'}</p>
                <img class="modal-underline" src="./assets/img/underline_login.svg" alt="Underline">
            </div>
            <div class="add-contact-right">
                <img src="./assets/img/Close.svg" class="close" onclick="closeAddContactModal()">

                ${isEditMode ? `
                <div class="contact-icon-large profileImg" style="background-color: ${color};">
                    ${initials}
                </div>
                ` : `
                <img class="profileImg" src="./assets/img/addContact_person.svg">
                `}

                <form id="addContactForm">
                    <input type="hidden" id="contactIndex" value="${contactIndex}">
                    <div class="form-group">
                        <input type="text" id="newContactName" placeholder="Name" autocomplete="name" value="${isEditMode ? contact.name : ''}">
                        <span class="error-message" id="nameError"></span>
                    </div>
                    <div class="form-group">
                        <input type="email" id="newContactEmail" placeholder="Email" autocomplete="email" value="${isEditMode ? contact.email : ''}">
                        <span class="error-message" id="emailError"></span>
                    </div>
                    <div class="form-group">
                        <input type="text" id="newContactPhone" placeholder="Phone" autocomplete="tel" value="${isEditMode ? contact.phone : ''}">
                        <span class="error-message" id="phoneError"></span>
                    </div>
                    <div class="form-actions">
                        ${isEditMode ? `
                        <button type="button" class="cancel-button" onclick="deleteContactFromModal(${contactIndex})">Delete <img src="./assets/img/delete.svg"></button>
                        ` : `
                        <button type="button" class="cancel-button" onclick="closeAddContactModal()">Cancel <img src="./assets/img/clear-x-image.svg"></button>
                        `}
                        <button type="submit" class="create-button">${isEditMode ? 'Save' : 'Create contact'} <img src="./assets/img/check.svg"></button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
