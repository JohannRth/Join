// Funktion, um die Details eines Kontakts in den Kontakt-Details-Bereich einzufügen
function renderContactDetails(contact) {
    const contactDetails = document.getElementById('contactDetails');
    if (contactDetails) {
        contactDetails.innerHTML = `
            <div class="contact-details-header" data-contact-key="${contact.key}">
                <div class="contact-icon-large" style="background-color: ${getColor(contact.name)};">
                    ${getInitials(contact.name)}
                </div>
                <div class="contact-details-info">
                    <h2>${contact.name}</h2>
                    <div class="contact-actions">
                        <button class="edit-button"><img src="./assets/img/edit.svg" alt="Edit"> Edit</button>
                        <button class="delete-button"><img src="./assets/img/delete.svg" alt="Delete"> Delete</button>
                    </div>
                </div>
            </div>
            <div class="contact-details-body">
                <h3>Contact Information</h3>
                <p><strong>Email</strong></p>
                <p class="contact-info-mail">${contact.email}</p>
                <p><strong>Phone</strong></p>
                <p class="contact-details-phone">${contact.phone}</p>
            </div>
        `;
    }
}

// Funktion zum Generieren des Modal-HTML
function getContactModalHTML(contact, isEditMode, contactKey, initials, color) {
    return `
        <div class="add-contact-modal-content">
            <div class="add-contact-left">
                <img class="modal-logo" src="./assets/img/join_logo_white.svg" alt="Join Logo">
                <img src="./assets/img/close_white.svg" class="close" onclick="closeAddContactModal()">
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
                    <input type="hidden" id="contactKey" value="${contact ? contact.key : ''}">
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
                        <button type="button" class="cancel-button" onclick="deleteContactFromModal('${contact ? contact.key : ''}')">Delete <img src="./assets/img/delete.svg"></button>
                        ` : `
                        <button type="button" class="cancel-button cancel-display-none" onclick="closeAddContactModal()">Cancel <img src="./assets/img/clear-x-image.svg"></button>
                        `}
                        <button type="submit" class="create-button">${isEditMode ? 'Save' : 'Create contact'} <img src="./assets/img/check.svg"></button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Funktion zum Generieren des Modal-HTML
function getContactInfoModalHTML(contact) {
    return `
        <div class="contact-info-modal-content">
            <img src="./assets/img/arrow-left-line.svg" class="arrowLeft close"></img>
            <div class="modal-main-content">
                <div class="contact-headline">
                    <h1>Contacts</h1>
                    <h2>Better with a Team</h2>
                    <img class="text-underline" src="./assets/img/underline_login.svg" alt="Underline">
                </div>
                <div class="contact-details-header" data-contact-key="${contact.key}">
                    <div class="contact-icon-large" style="background-color: ${getColor(contact.name)};">
                        ${getInitials(contact.name)}
                    </div>
                    <div class="contact-details-info">
                        <h2>${contact.name}</h2>
                        <div class="contact-actions">
                            <button class="edit-button"><img src="./assets/img/edit.svg" alt="Edit"> Edit</button>
                            <button class="delete-button"><img src="./assets/img/delete.svg" alt="Delete"> Delete</button>
                        </div>
                    </div>
                </div>
                <div class="contact-details-body">
                    <h3>Contact Information</h3>
                    <p><strong>Email</strong></p>
                    <p class="contact-info-mail">${contact.email}</p>
                    <p><strong>Phone</strong></p>
                    <p class="contact-details-phone">${contact.phone}</p>
                </div>
            </div>
            <img src="./assets/img/menu-contact-options.svg" class="menu-contact-options"></img>
            <div class="dropdown-contact-options">
                <button class="edit-button"><img src="./assets/img/edit.svg" alt="Edit"> Edit</button>
                <button class="delete-button"><img src="./assets/img/delete.svg" alt="Delete"> Delete</button>
            </div>
        </div>
    `;
}