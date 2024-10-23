// Array mit den Kontakten
const contacts = [
    {
        'name': 'Anton Mayer',
        'email': 'antom@gmail.com',
        'phone': '+49 176 12345678'
    },
    {
        'name': 'Anja Schulz',
        'email': 'schulz@hotmail.com',
        'phone': '+49 176 23456789'
    },
    {
        'name': 'Benedikt Ziegler',
        'email': 'benedikt@gmail.com',
        'phone': '+49 176 34567890'
    },
    {
        'name': 'David Eisenberg',
        'email': 'davidberg@gmail.com',
        'phone': '+49 176 45678901'
    },
    {
        'name': 'Eva Fischer',
        'email': 'eva@gmail.com',
        'phone': '+49 176 56789012'
    },
    {
        'name': 'Emmanuel Mauer',
        'email': 'emmanuelma@gmail.com',
        'phone': '+49 176 67890123'
    }
];

// Liste der Farben für die Icons
const colors = [
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

// Hauptfunktion zum Laden der alphabetisch sortierten Kontakte
function loadContacts() {
    // Kontakte alphabetisch gruppieren
    const groupedContacts = groupContactsByAlphabet();

    const contactContainer = document.getElementById('contacts');
    contactContainer.innerHTML = ''; // Container leeren

    // Durch die gruppierten Kontakte iterieren und anzeigen
    for (const letter in groupedContacts) {
        if (groupedContacts.hasOwnProperty(letter)) {
            // Überschrift für den Buchstaben hinzufügen
            const letterHeader = `<h2 class="contact-letter-header">${letter}</h2>`;
            contactContainer.insertAdjacentHTML('beforeend', letterHeader);

            // Trennungsbild als HTML-String hinzufügen
            const separatorImage = `<img class="contact-list-separator" src="./assets/img/contacts_seperator.svg" alt="Separator-Line">`;
            contactContainer.insertAdjacentHTML('beforeend', separatorImage);

            // Kontakte für diesen Buchstaben hinzufügen
            groupedContacts[letter].forEach(contact => {
                const contactElement = createContactElement(contact);
                contactContainer.appendChild(contactElement);
            });
        }
    }
}

// Funktion zum Gruppieren der Kontakte nach dem Anfangsbuchstaben
function groupContactsByAlphabet() {
    // Kontakte alphabetisch sortieren
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    // Kontakte nach Buchstaben gruppieren
    const groupedContacts = {};
    contacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });

    return groupedContacts;
}

// Funktion zum Erstellen des Kontakt-Elements
function createContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.className = 'contact-item';

    // Erstelle das Icon-Element und die Kontaktinformationen
    const iconElement = createContactIcon(contact.name);
    const contactInfoElement = createContactInfo(contact);

    // Icon und Kontaktinformationen zusammenfügen
    contactElement.appendChild(iconElement);
    contactElement.appendChild(contactInfoElement);

    // Event-Listener für Klick auf den Kontakt hinzufügen
    contactElement.addEventListener('click', () => displayContactDetails(contact));

    return contactElement;
}

// Funktion zum Erstellen des Icons mit den Initialen
function createContactIcon(name) {
    const iconElement = document.createElement('div');
    iconElement.className = 'contact-icon';
    iconElement.textContent = getInitials(name);
    iconElement.style.backgroundColor = getColor(name);
    return iconElement;
}

// Funktion zum Erstellen der Kontaktinformationen
function createContactInfo(contact) {
    const contactInfoElement = document.createElement('div');
    contactInfoElement.className = 'contact-info';
    contactInfoElement.innerHTML = `
        <span class="contact-info-name">${contact.name}</span>
        <span class="contact-info-mail">${contact.email}</span>
    `;
    return contactInfoElement;
}

// Funktion, um die Details eines Kontakts anzuzeigen
function displayContactDetails(contact) {
    // Entferne die aktive Markierung von allen Kontakten
    const allContactItems = document.querySelectorAll('.contact-item');
    allContactItems.forEach(item => {
        item.classList.remove('active-contact');
    });

    // Finde das aktuelle Kontakt-Element und füge die aktive Markierung hinzu
    const currentContactElement = Array.from(allContactItems).find(item =>
        item.querySelector('.contact-info-name').textContent === contact.name
    );
    if (currentContactElement) {
        currentContactElement.classList.add('active-contact');
    }

    const contactDetails = document.getElementById('contactDetails');
    if (contactDetails) {
        contactDetails.innerHTML = `
            <div class="contact-details-header">
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
                <p class="contact-details-email">${contact.email}</p>
                <p><strong>Phone</strong></p>
                <p class="contact-details-phone">${contact.phone}</p>
            </div>
        `;
    }
}


// Funktion zum Erhalten der Initialen des Namens
function getInitials(name) {
    const nameParts = name.split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
}

function openAddContactModal() {
    const modal = document.getElementById('addContactModal');
    const modalContent = document.querySelector('.add-contact-modal-content');
    
    if (modal) {
        modal.style.display = 'flex';
        modalContent.classList.remove('slide-out');
        modalContent.classList.add('slide-in');
    }
}

function closeAddContactModal() {
    const modal = document.getElementById('addContactModal');
    const modalContent = document.querySelector('.add-contact-modal-content');

    if (modalContent) {
        modalContent.classList.remove('slide-in');
        modalContent.classList.add('slide-out');
        
        // Warte, bis die Slide-Out-Animation abgeschlossen ist
        setTimeout(() => {
            modal.style.display = 'none';
        }, 120); // Dauer der Slide-Out-Animation (0.12s)
    }
}

// Funktion zum Hinzufügen eines neuen Kontakts
function addNewContact(event) {
    event.preventDefault();
    const name = document.getElementById('newContactName').value;
    const email = document.getElementById('newContactEmail').value;
    const phone = document.getElementById('newContactPhone').value;

    if (name && email && phone) {
        contacts.push({ name, email, phone });
        loadContacts();
        closeAddContactModal();
    }
}

// EventListener für das Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    // Kontakte laden
    loadContacts();

    // EventListener für den "Add Contact" Button
    const addContactBtn = document.getElementById('addContactBtn');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', openAddContactModal);
    }

    // EventListener für das Formular zum Hinzufügen eines neuen Kontakts
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', addNewContact);
    }

    // EventListener für das Schließen des Modals
    const closeModalButton = document.querySelector('.close');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeAddContactModal);
    }

    // Modal schließen, wenn außerhalb des Modal-Fensters geklickt wird
    window.onclick = function (event) {
        const modal = document.getElementById('addContactModal');
        if (event.target === modal) {
            closeAddContactModal();
        }
    };
});

document.addEventListener('click', function (event) {
    if (event.target.closest('.edit-button')) {
        const contactName = document.querySelector('.contact-details-info h2').innerText;
        console.log(`Bearbeiten des Kontakts: ${contactName}`);
        // Logik für das Bearbeiten hinzufügen (z.B. Modal öffnen mit vorgefüllten Daten)
    }

    if (event.target.closest('.delete-button')) {
        const contactName = document.querySelector('.contact-details-info h2').innerText;
        console.log(`Löschen des Kontakts: ${contactName}`);
        // Logik für das Löschen hinzufügen (z.B. Bestätigung und Kontakt entfernen)
        deleteContact(contactName);
    }
});

// Funktion, um einen Kontakt zu löschen
function deleteContact(name) {
    const index = contacts.findIndex(contact => contact.name === name);
    if (index !== -1) {
        contacts.splice(index, 1);
        loadContacts(); // Aktualisiert die Kontaktliste
        document.getElementById('contactDetails').innerHTML = ''; // Leert die Kontaktdetails, wenn der Kontakt gelöscht wurde
    }
}

// Funktion zum Öffnen des Modals für neuen Kontakt
function openAddContactModal() {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        // Setze den HTML-Inhalt des Modals
        modal.innerHTML = `
            <div class="add-contact-modal-content">
                <div class="add-contact-left">
                    <img class="modal-logo" src="./assets/img/join_logo_white.svg" alt="Join Logo">
                    <h2>Add contact</h2>
                    <p>Tasks are better with a team!</p>
                    <img class="modal-underline" src="./assets/img/underline_login.svg" alt="Join Logo">
                </div>
                <div class="add-contact-right">
                    <img src="./assets/img/Close.svg" class="close" onclick="closeAddContactModal()">
                    
                        <img class="profileImg" src="./assets/img/addContact_person.svg">
                    
                    <form id="addContactForm">
                        <div class="form-group">
                            <input type="text" id="newContactName" placeholder="Name" autocomplete="name">
                            <span class="error-message" id="nameError"></span>
                        </div>
                        <div class="form-group">
                            <input type="email" id="newContactEmail" placeholder="Email" autocomplete="email">
                            <span class="error-message" id="emailError"></span>
                        </div>
                        <div class="form-group">
                            <input type="text" id="newContactPhone" placeholder="Phone" autocomplete="tel">
                            <span class="error-message" id="phoneError"></span>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-button" onclick="closeAddContactModal()">Cancel <img src="./assets/img/clear-x-image.svg"></button>
                            <button type="submit" class="create-button">Create contact <img src="./assets/img/check.svg"></button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        // Zeige das Modal an
        modal.style.display = 'flex';

        // Event-Listener zum Hinzufügen eines neuen Kontakts
        const addContactForm = document.getElementById('addContactForm');
        if (addContactForm) {
            addContactForm.addEventListener('submit', addNewContact);
        }
    }
}

function addNewContact(event) {
    event.preventDefault();

    let isFormValid = true;

    // Alle Felder validieren
    isFormValid = nameValidation(isFormValid);
    isFormValid = emailValidation(isFormValid);
    isFormValid = phoneValidation(isFormValid);

    // Wenn das Formular nicht gültig ist, beenden
    if (!isFormValid) {
        return;
    }

    // Wenn das Formular gültig ist, neuen Kontakt hinzufügen
    const name = document.getElementById('newContactName').value.trim();
    const email = document.getElementById('newContactEmail').value.trim();
    const phone = document.getElementById('newContactPhone').value.trim();

    // Neuen Kontakt dem Array hinzufügen
    contacts.push({ name, email, phone });

    // Kontakte neu laden
    loadContacts();

    // Modal schließen
    closeAddContactModal();
}



function nameValidation(isFormValid) {
    const nameInput = document.getElementById("newContactName");
    const nameError = document.getElementById("nameError");

    if (!nameInput.value.trim()) {
        nameError.innerHTML = "Name cannot be empty.";
        nameError.style.display = 'flex';
        isFormValid = false;
    } else {
        nameError.innerHTML = "";
        nameError.style.display = 'none';
    }

    return isFormValid;
}

function emailValidation(isFormValid) {
    const emailInput = document.getElementById("newContactEmail");
    const emailError = document.getElementById("emailError");
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailInput.value.trim()) {
        emailError.innerHTML = "Email cannot be empty.";
        emailError.style.display = 'flex';
        isFormValid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
        emailError.innerHTML = "Please enter a valid email address.";
        emailError.style.display = 'flex';
        isFormValid = false;
    } else {
        emailError.innerHTML = "";
        emailError.style.display = 'none';
    }

    return isFormValid;
}

function phoneValidation(isFormValid) {
    const phoneInput = document.getElementById("newContactPhone");
    const phoneError = document.getElementById("phoneError");
    const phonePattern = /^\+?[0-9]{1,3}[\s]?[0-9\s]{6,15}$/;

    if (!phoneInput.value.trim()) {
        phoneError.innerHTML = "Phone number cannot be empty.";
        phoneError.style.display = 'flex';
        isFormValid = false;
    } else if (!phonePattern.test(phoneInput.value.trim())) {
        phoneError.innerHTML = "Please enter a valid phone number.";
        phoneError.style.display = 'flex';
        isFormValid = false;
    } else {
        phoneError.innerHTML = "";
        phoneError.style.display = 'none';
    }

    return isFormValid;
}
