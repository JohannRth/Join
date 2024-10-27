// Array mit den Kontakten
let contacts = [];

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
async function loadContacts() {
    try {
        // Kontakte aus Firebase laden
        const contactsData = await loadData('contacts');
        contacts = []; // Kontakte-Array zurücksetzen

        if (contactsData) {
            // Kontakte-Daten in ein Array umwandeln und den Schlüssel (key) speichern
            for (const [key, contact] of Object.entries(contactsData)) {
                // Überprüfen, ob der Kontakt einen Namen hat
                if (contact.name) {
                    contacts.push({
                        key: key,
                        ...contact
                    });
                } else {
                    console.warn(`Kontakt mit Schlüssel ${key} hat keinen Namen und wird übersprungen.`);
                }
            }
        }

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
    } catch (error) {
        console.error('Error loading contacts:', error);
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
function addContactElements(container, contactsGroup) {
    contactsGroup.forEach(contact => {
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
    if (!name || typeof name !== 'string') {
        return { firstInitial: '', lastInitial: '' };
    }
    const [firstName, lastName = ''] = name.split(' ');
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return { firstInitial, lastInitial };
}

// Funktion zum Erstellen des Kontakt-Elements
function createContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.className = 'contact-item';
    contactElement.setAttribute('data-contact-key', contact.key); // Setzen des data-contact-key

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

// Funktion, um die Details eines Kontakts anzuzeigen
function displayContactDetails(contact) {
    const contactDetailsDiv = document.getElementById('contactDetails');
    const mainBoard = document.querySelector('.main-board');

    // Verhindere Scrollen während der Animation
    mainBoard.style.overflow = 'hidden';

    // Wenn bereits ein Kontakt angezeigt wird, blende ihn aus
    if (contactDetailsDiv.classList.contains('active')) {
        contactDetailsDiv.classList.remove('active');
        contactDetailsDiv.classList.add('fade-out');

        // Warte auf das Ende der Ausblende-Animation
        contactDetailsDiv.addEventListener('animationend', function () {
            // Entferne die fade-out Klasse, um Platz für das Hereinschieben zu machen
            contactDetailsDiv.classList.remove('fade-out');

            // Neue Kontaktinformationen laden und anzeigen
            renderContactDetails(contact);

            // Zeige den neuen Kontakt mit der Slide-in-Animation an
            contactDetailsDiv.classList.add('active');
        }, { once: true });
    } else {
        // Wenn keine Details angezeigt werden, direkt den neuen Kontakt anzeigen
        renderContactDetails(contact);
        contactDetailsDiv.classList.add('active');
    }

    // Markiere den aktuellen Kontakt als aktiv
    removeActiveContactMarker();
    setActiveContactMarker(contact);
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
        item.getAttribute('data-contact-key') === contact.key
    );

    if (currentContactElement) {
        currentContactElement.classList.add('active-contact');
    }
}

// Funktion zum Erhalten der Initialen des Namens
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    const nameParts = name.trim().split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; // Standardfarbe
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
}

// Funktion zum Öffnen des Add Contact Modals
function openAddContactModal(contact = null) {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        const isEditMode = contact !== null;
        const contactKey = isEditMode ? contact.key : '';

        // Initialen und Farbe generieren, wenn im Bearbeitungsmodus
        const { initials, color } = getContactInitialsAndColor(contact);

        // HTML für das Modal erhalten
        modal.innerHTML = getContactModalHTML(contact, isEditMode, contactKey, initials, color);

        // Modal anzeigen
        modal.style.display = 'flex';

        // Event Listener für das Formular einrichten
        setupAddContactFormListener();
    }
}

// Funktion zum Einrichten des Formular-Event-Listeners im Modal
function setupAddContactFormListener() {
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', addNewContact);
    }
}


// Funktion zum Generieren der Kontakt-Initialen und Farbe
function getContactInitialsAndColor(contact) {
    if (contact) {
        const initials = getInitials(contact.name);
        const color = getColor(contact.name);
        return { initials, color };
    }
    return { initials: '', color: '' };
}

// Funktion, um das Modal zu schließen
function closeAddContactModal() {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = ''; // Modal-Inhalt zurücksetzen
    }
}

// Funktion zum Hinzufügen eines neuen Kontakts
async function addNewContact(event) {
    event.preventDefault();

    console.log('Adding or updating contact...');

    // Formular validieren
    const isFormValid = validateForm(); // Hier wurde handleFormValidation() durch validateForm() ersetzt

    if (!isFormValid) {
        console.log('Form validation failed.');
        return;
    }

    // Kontakt-Daten aus dem Formular holen
    const newContact = getContactFormData();
    console.log('New Contact Data:', newContact);

    // Kontakt-Schlüssel ermitteln
    const key = getContactKey();
    console.log('Contact Key:', key);

    if (key) {
        // Bearbeitungsmodus - aktualisiere den bestehenden Kontakt
        console.log(`Updating contact with key: ${key}`);
        await updateData('contacts/' + key, newContact);
    } else {
        // Hinzufügen-Modus - füge neuen Kontakt hinzu
        console.log('Adding new contact...');
        const result = await saveData('contacts', newContact);
        newContact.key = result.name; // Das ist der generierte Schlüssel von Firebase
        console.log('New Contact Key:', newContact.key);
    }

    // Kontakte neu laden und Modal schließen
    await loadContacts();
    closeAddContactModal();

    // Zeige den neuen oder aktualisierten Kontakt in den Kontaktdetails an
    const updatedContact = contacts.find(c => c.key === (key || newContact.key));
    if (updatedContact) {
        displayContactDetails(updatedContact);
        console.log('Displayed Contact Details:', updatedContact);
    } else {
        console.warn('Updated contact not found.');
    }

    // Erfolgsnachricht anzeigen
    const mode = key ? 'edit' : 'add';
    showSuccessPopup(mode);
}


// Funktion, um den Kontakt-Schlüssel aus dem versteckten Input-Feld zu holen
function getContactKey() {
    const contactKeyInput = document.getElementById('contactKey');
    return contactKeyInput ? contactKeyInput.value : null;
}

// Funktion, um einen Kontakt zu löschen
async function deleteContact(contactKey) {
    if (contactKey) {
        await deleteData('contacts/' + contactKey);
        await loadContacts();
        document.getElementById('contactDetails').innerHTML = '';
    }
}

// Funktion, um einen Kontakt von der Modal aus zu löschen
async function deleteContactFromModal(contactKey) {
    if (contactKey) {
        await deleteData('contacts/' + contactKey);
        await loadContacts();
        closeAddContactModal();
        document.getElementById('contactDetails').innerHTML = '';

        // Erfolgsnachricht anzeigen
        showSuccessPopup('delete');
    }
}



// Funktion zum Anzeigen des Erfolgs-Popups
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

// Validierungsfunktionen
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

// Hauptfunktion zum Initialisieren der EventListener, wenn die Seite geladen wird
document.addEventListener('DOMContentLoaded', () => {
    loadContacts(); // Kontakte laden
    setupAddContactButton();
    setupAddContactForm();
    setupCloseModalButton();
    setupWindowClickCloseModal();
});

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

// Event Listener für Bearbeitungs- und Löschbuttons
document.addEventListener('click', function (event) {
    if (event.target.closest('.edit-button')) {
        const contactDetailsHeader = document.querySelector('.contact-details-header');
        if (contactDetailsHeader) {
            const contactKey = contactDetailsHeader.getAttribute('data-contact-key');
            if (contactKey) {
                const contact = contacts.find(c => c.key === contactKey);
                if (contact) {
                    openAddContactModal(contact);
                }
            }
        }
    }

    if (event.target.closest('.delete-button')) {
        const contactDetailsHeader = document.querySelector('.contact-details-header');
        if (contactDetailsHeader) {
            const contactKey = contactDetailsHeader.getAttribute('data-contact-key');
            if (contactKey) {
                deleteContact(contactKey);
            }
        }
    }
});
