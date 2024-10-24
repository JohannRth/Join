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
    
    // Leere den Container
    clearContactContainer(contactContainer);

    // Gruppierte Kontakte anzeigen
    for (const letter in groupedContacts) {
        if (groupedContacts.hasOwnProperty(letter)) {
            addLetterHeader(contactContainer, letter);
            addSeparatorImage(contactContainer);
            addContactElements(contactContainer, groupedContacts[letter]);
        }
    }
}

// Funktion, um den Kontakt-Container zu leeren
function clearContactContainer(container) {
    container.innerHTML = ''; // Container leeren
}

// Funktion, um eine Buchstabenüberschrift hinzuzufügen
function addLetterHeader(container, letter) {
    const letterHeader = `<h2 class="contact-letter-header">${letter}</h2>`;
    container.insertAdjacentHTML('beforeend', letterHeader);
}

// Funktion, um das Trennungsbild hinzuzufügen
function addSeparatorImage(container) {
    const separatorImage = `<img class="contact-list-separator" src="./assets/img/contacts_seperator.svg" alt="Separator-Line">`;
    container.insertAdjacentHTML('beforeend', separatorImage);
}

// Funktion, um alle Kontakte unter einem Buchstaben hinzuzufügen
function addContactElements(container, contacts) {
    contacts.forEach(contact => {
        const contactElement = createContactElement(contact);
        container.appendChild(contactElement);
    });
}

// Hauptfunktion zum Gruppieren der Kontakte
function groupContactsByAlphabet() {
    // Kontakte sortieren
    contacts.sort(contactComparator);

    // Kontakte gruppieren
    return groupContactsByFirstLetter(contacts);
}

// Funktion zum Gruppieren der Kontakte nach dem Anfangsbuchstaben des Vornamens
function groupContactsByFirstLetter(contacts) {
    const groupedContacts = {};
    contacts.forEach(contact => {
        const firstName = contact.name.split(' ')[0];
        const firstLetter = firstName.charAt(0).toUpperCase();
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });
    return groupedContacts;
}

// Vergleichsfunktion für die Sortierung
function contactComparator(a, b) {
    const aInitials = getFirstAndLastInitials(a.name);
    const bInitials = getFirstAndLastInitials(b.name);

    // Zuerst nach dem Anfangsbuchstaben des Vornamens sortieren
    const firstInitialComparison = aInitials.firstInitial.localeCompare(bInitials.firstInitial);
    if (firstInitialComparison !== 0) {
        return firstInitialComparison;
    }

    // Wenn die Anfangsbuchstaben gleich sind, nach dem Anfangsbuchstaben des Nachnamens sortieren
    const lastInitialComparison = aInitials.lastInitial.localeCompare(bInitials.lastInitial);
    if (lastInitialComparison !== 0) {
        return lastInitialComparison;
    }

    // Falls immer noch gleich, gesamten Namen vergleichen
    return a.name.localeCompare(b.name);
}

// Hilfsfunktion zum Extrahieren der Initialen
function getFirstAndLastInitials(name) {
    const [firstName, lastName = ''] = name.split(' ');
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return { firstInitial, lastInitial };
}

// Funktion zum Erstellen des Kontakt-Elements
function createContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.className = 'contact-item';
    const contactIndex = contacts.indexOf(contact);
    contactElement.setAttribute('data-contact-index', contactIndex);

    const iconElement = createContactIcon(contact.name);
    const contactInfoElement = createContactInfo(contact);

    contactElement.appendChild(iconElement);
    contactElement.appendChild(contactInfoElement);

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

// Hauptfunktion, um die Details eines Kontakts anzuzeigen
function displayContactDetails(contact) {
    removeActiveContactMarker(); // Entferne die Markierung von allen Kontakten
    setActiveContactMarker(contact); // Markiere den aktuell ausgewählten Kontakt
    renderContactDetails(contact); // Zeige die Details des ausgewählten Kontakts an
}

// Funktion, um die aktive Markierung von allen Kontakten zu entfernen
function removeActiveContactMarker() {
    const allContactItems = document.querySelectorAll('.contact-item');
    allContactItems.forEach(item => {
        item.classList.remove('active-contact');
    });
}

// Funktion, um den aktuell ausgewählten Kontakt als aktiv zu markieren
function setActiveContactMarker(contact) {
    const allContactItems = document.querySelectorAll('.contact-item');
    const currentContactElement = Array.from(allContactItems).find(item =>
        item.querySelector('.contact-info-name').textContent === contact.name
    );

    if (currentContactElement) {
        currentContactElement.classList.add('active-contact');
    }
}

// Funktion, um die Details eines Kontakts in den Kontakt-Details-Bereich einzufügen
function renderContactDetails(contact) {
    const contactDetails = document.getElementById('contactDetails');
    if (contactDetails) {
        const contactIndex = contacts.indexOf(contact);
        contactDetails.innerHTML = `
            <div class="contact-details-header" data-contact-index="${contactIndex}">
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
    const nameParts = name.trim().split(' ');
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
    const modalContent = modal.querySelector('.add-contact-modal-content');

    // Stelle sicher, dass das Modal sichtbar ist
    modal.style.display = 'flex';
    
    // Entferne die `slide-out` Klasse, falls sie vorhanden ist (z.B. durch vorheriges Schließen)
    if (modalContent.classList.contains('slide-out')) {
        modalContent.classList.remove('slide-out');
    }

    // Füge die `slide-in` Animation durch die Klasse hinzu
    modalContent.classList.add('add-contact-modal-content');
}


function closeAddContactModal() {
    const modal = document.getElementById('addContactModal');
    const modalContent = modal.querySelector('.add-contact-modal-content');

    // Füge die `slide-out` Klasse hinzu, um die Schließen-Animation zu starten
    modalContent.classList.add('slide-out');

    // Verwende ein Timeout, das der Animationszeit entspricht, um das Modal nach der Animation zu verstecken
    setTimeout(() => {
        modal.style.display = 'none';
        // Entferne die `slide-in` Klasse, damit die Animation beim erneuten Öffnen wieder abgespielt wird
        modalContent.classList.remove('add-contact-modal-content');
    }, 120); // 0.12s = 120ms
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

// Hauptfunktion zum Initialisieren der EventListener, wenn die Seite geladen wird
document.addEventListener('DOMContentLoaded', () => {
    loadPageContacts();
    setupAddContactButton();
    setupAddContactForm();
    setupCloseModalButton();
    setupWindowClickCloseModal();
});

// Funktion zum Laden der Kontakte beim Laden der Seite
function loadPageContacts() {
    loadContacts(); // Kontakte laden
}

// Funktion zum Einrichten des "Add Contact" Buttons
function setupAddContactButton() {
    const addContactBtn = document.getElementById('addContactBtn');
    if (addContactBtn) {
        addContactBtn.addEventListener('click', () => openAddContactModal());
    }
}

// Funktion zum Einrichten des Formulars für das Hinzufügen eines neuen Kontakts
function setupAddContactForm() {
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', addNewContact);
    }
}

// Funktion zum Einrichten des Schließen-Buttons des Modals
function setupCloseModalButton() {
    const closeModalButton = document.querySelector('.close');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeAddContactModal);
    }
}

// Funktion zum Schließen des Modals, wenn außerhalb des Modals geklickt wird
function setupWindowClickCloseModal() {
    window.onclick = function (event) {
        const modal = document.getElementById('addContactModal');
        if (event.target === modal) {
            closeAddContactModal();
        }
    };
}


document.addEventListener('click', function (event) {
    if (event.target.closest('.edit-button')) {
        const contactDetailsHeader = document.querySelector('.contact-details-header');
        const contactIndex = contactDetailsHeader.getAttribute('data-contact-index');
        if (contactIndex !== null) {
            const contact = contacts[contactIndex];
            openAddContactModal(contact);
        }
    }

    if (event.target.closest('.delete-button')) {
        const contactDetailsHeader = document.querySelector('.contact-details-header');
        const contactIndex = contactDetailsHeader.getAttribute('data-contact-index');
        if (contactIndex !== null) {
            deleteContact(contactIndex);
        }
    }
});

// Funktion, um einen Kontakt zu löschen
function deleteContact(contactIndex) {
    const index = parseInt(contactIndex, 10);
    if (!isNaN(index)) {
        contacts.splice(index, 1);
        loadContacts();
        document.getElementById('contactDetails').innerHTML = '';
    }
}


function getContactInitialsAndColor(contact) {
    if (contact) {
        const initials = getInitials(contact.name);
        const color = getColor(contact.name);
        return { initials, color };
    }
    return { initials: '', color: '' };
}

function setupAddContactFormListener() {
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', addNewContact);
    }
}

function openAddContactModal(contact = null) {
    // Sicherstellen, dass `contact` ein gültiges Objekt oder null ist
    if (contact && (typeof contact !== 'object' || contact instanceof Event)) {
        contact = null;
    }

    const modal = document.getElementById('addContactModal');
    if (modal) {
        const isEditMode = contact !== null;
        const contactIndex = isEditMode ? contacts.indexOf(contact) : '';

        // Initialen und Farbe generieren, wenn im Bearbeitungsmodus
        const { initials, color } = getContactInitialsAndColor(contact);

        // HTML für das Modal erhalten
        modal.innerHTML = getContactModalHTML(contact, isEditMode, contactIndex, initials, color);

        // Modal anzeigen
        modal.style.display = 'flex';

        // Event Listener für das Formular einrichten
        setupAddContactFormListener();
    }
}


function getContactInitialsAndColor(contact) {
    if (contact) {
        const initials = getInitials(contact.name);
        const color = getColor(contact.name);
        return { initials, color };
    }
    return { initials: '', color: '' };
}

function setupAddContactFormListener() {
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', addNewContact);
    }
}

function deleteContactFromModal(contactIndex) {
    const index = parseInt(contactIndex, 10);
    if (!isNaN(index)) {
        contacts.splice(index, 1);
        loadContacts();
        closeAddContactModal();
        document.getElementById('contactDetails').innerHTML = '';

        // Erfolgsnachricht anzeigen
        showSuccessPopup('delete');
    }
}

function addNewContact(event) {
    event.preventDefault();

    // Formular validieren
    const isFormValid = handleFormValidation();

    if (!isFormValid) {
        return;
    }

    // Kontakt-Daten aus dem Formular holen
    const newContact = getContactFormData();

    // Kontaktindex ermitteln
    const index = getContactIndex();

    // Kontakt speichern (hinzufügen oder aktualisieren)
    const updatedContact = saveContact(newContact, index);

    // Kontakte neu laden und Modal schließen
    loadContacts();
    closeAddContactModal();

    // Zeige den neuen oder aktualisierten Kontakt in den Kontaktdetails an
    displayContactDetails(updatedContact);

    // Erfolgsnachricht anzeigen
    const mode = !isNaN(index) ? 'edit' : 'add';
    showSuccessPopup(mode);
}

function handleFormValidation() {
    return validateForm();
}

function getContactIndex() {
    const contactIndexInput = document.getElementById('contactIndex');
    const contactIndex = contactIndexInput.value;
    return parseInt(contactIndex, 10);
}

function saveContact(newContact, index) {
    let updatedContact;
    if (!isNaN(index)) {
        // Bearbeitungsmodus - aktualisiere den bestehenden Kontakt
        const existingContact = contacts[index];
        existingContact.name = newContact.name;
        existingContact.email = newContact.email;
        existingContact.phone = newContact.phone;
        updatedContact = existingContact;
    } else {
        // Hinzufügen-Modus - füge neuen Kontakt hinzu
        addContact(newContact);
        updatedContact = newContact;
    }
    return updatedContact;
}



// Funktion, um das Erfolgs-Popup anzuzeigen
function showSuccessPopup(mode) {
    const popup = document.getElementById('popupContactSuccess');
    if (popup) {
        let message = '';
        if (mode === 'edit') {
            message = 'Contact successfully updated';
        } else if (mode === 'add') {
            message = 'Contact successfully created';
        } else if (mode === 'delete') {
            message = 'Contact successfully deleted';
        }

        popup.querySelector('p').textContent = message;
        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.remove('show');
        }, 1000);
    }
}


// Funktion, um das Formular zu validieren
function validateForm() {
    let isFormValid = true;
    isFormValid = nameValidation(isFormValid);
    isFormValid = emailValidation(isFormValid);
    isFormValid = phoneValidation(isFormValid);
    return isFormValid;
}

// Funktion, um die Kontakt-Daten aus den Eingabefeldern zu holen
function getContactFormData() {
    const name = document.getElementById('newContactName').value.trim();
    const email = document.getElementById('newContactEmail').value.trim();
    const phone = document.getElementById('newContactPhone').value.trim();

    return { name, email, phone };
}

// Funktion, um einen neuen Kontakt zur Kontaktliste hinzuzufügen
function addContact(contact) {
    contacts.push(contact);
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
