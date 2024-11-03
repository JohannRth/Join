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
function getContactInfoModalHTML(contact) {
    return `
        <div class="contact-info-modal-content">
            <span class="close">&times;</span>
            <div class="modal-main-content">
                <div class="contact-headline">
                    <h1>Contacts</h1>
                    <img class="horizontalline" src="./assets/img/horizontalline_contacts.svg" alt="Line">
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
        </div>
    `;
}