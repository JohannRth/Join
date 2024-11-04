// contacts.js

// Array mit den Kontakten
let contacts = [];

// Liste der Farben für die Icons
const colors = [
    "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8",
    "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701",
    "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"
];

// Hauptfunktion zum Laden der alphabetisch sortierten Kontakte
async function loadContacts() {
    try {
        const contactsData = await loadData('contacts');
        contacts = parseContactsData(contactsData);
        const groupedContacts = groupContactsByAlphabet();
        renderGroupedContacts(groupedContacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Funktion zum Parsen der Kontakte-Daten
function parseContactsData(data) {
    const parsedContacts = [];
    if (data) {
        for (const [key, contact] of Object.entries(data)) {
            if (contact.name) {
                parsedContacts.push({ key, ...contact });
            } else {
                console.warn(`Kontakt mit Schlüssel ${key} hat keinen Namen und wird übersprungen.`);
            }
        }
    }
    return parsedContacts;
}

// Funktion zum Gruppieren der Kontakte nach Alphabet
function groupContactsByAlphabet() {
    contacts.sort(contactComparator);
    return groupContactsByFirstLetter(contacts);
}

// Funktion zum Gruppieren der Kontakte nach dem Anfangsbuchstaben des Vornamens
function groupContactsByFirstLetter(contactsList) {
    return contactsList.reduce((groups, contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        groups[firstLetter] = groups[firstLetter] || [];
        groups[firstLetter].push(contact);
        return groups;
    }, {});
}

// Vergleichsfunktion für die Sortierung
function contactComparator(a, b) {
    const aInitials = getFirstAndLastInitials(a.name);
    const bInitials = getFirstAndLastInitials(b.name);

    return aInitials.firstInitial.localeCompare(bInitials.firstInitial) ||
        aInitials.lastInitial.localeCompare(bInitials.lastInitial) ||
        a.name.localeCompare(b.name);
}

// Hilfsfunktion zum Extrahieren der Initialen
function getFirstAndLastInitials(name) {
    const [firstName, lastName = ''] = name.split(' ');
    return {
        firstInitial: firstName.charAt(0).toUpperCase(),
        lastInitial: lastName.charAt(0).toUpperCase()
    };
}

// Funktion zum Rendern der gruppierten Kontakte
function renderGroupedContacts(groupedContacts) {
    const contactContainer = document.getElementById('contacts');
    clearContactContainer(contactContainer);

    Object.keys(groupedContacts).sort().forEach(letter => {
        addLetterHeader(contactContainer, letter);
        addSeparatorImage(contactContainer);
        addContactElements(contactContainer, groupedContacts[letter]);
    });
}

// Funktion, um den Kontakt-Container zu leeren
const clearContactContainer = container => container.innerHTML = '';

// Funktion, um eine Buchstabenüberschrift hinzuzufügen
const addLetterHeader = (container, letter) => {
    container.insertAdjacentHTML('beforeend', `<h2 class="contact-letter-header">${letter}</h2>`);
};

// Funktion, um das Trennungsbild hinzuzufügen
const addSeparatorImage = container => {
    container.insertAdjacentHTML('beforeend', `<img class="contact-list-separator" src="./assets/img/contacts_seperator.svg" alt="Separator-Line">`);
};

// Funktion, um alle Kontakte unter einem Buchstaben hinzuzufügen
const addContactElements = (container, contactsGroup) => {
    contactsGroup.forEach(contact => {
        const contactElement = createContactElement(contact);
        container.appendChild(contactElement);
    });
};

// Funktion zum Erstellen des Kontakt-Elements
function createContactElement(contact) {
    const contactElement = document.createElement('div');
    contactElement.className = 'contact-item';
    contactElement.dataset.contactKey = contact.key;

    const iconElement = createContactIcon(contact.name);
    const contactInfoElement = createContactInfo(contact);

    contactElement.append(iconElement, contactInfoElement);
    contactElement.addEventListener('click', () => displayContactDetails(contact));

    return contactElement;
}

// Funktion zum Erstellen des Icons mit den Initialen
const createContactIcon = name => {
    const iconElement = document.createElement('div');
    iconElement.className = 'contact-icon';
    iconElement.textContent = getInitials(name);
    iconElement.style.backgroundColor = getColor(name);
    return iconElement;
};

// Funktion zum Erstellen der Kontaktinformationen
const createContactInfo = contact => {
    const contactInfoElement = document.createElement('div');
    contactInfoElement.className = 'contact-info';
    contactInfoElement.innerHTML = `
        <span class="contact-info-name">${contact.name}</span>
        <span class="contact-info-mail">${contact.email}</span>
    `;
    return contactInfoElement;
};

// Hilfsfunktion zum Überprüfen der Bildschirmbreite
function isSmallScreen() {
    return window.innerWidth < 800;
}

// Funktion zum Ausblenden des Hauptinhalts
function hideMainContent() {
    const mainBoardContent = document.querySelector('.main-board-content');
    if (mainBoardContent) {
        mainBoardContent.style.display = 'none';
    }
}

// Funktion zum Einblenden des Hauptinhalts
function showMainContent() {
    const mainBoardContent = document.querySelector('.main-board-content');
    if (mainBoardContent) {
        mainBoardContent.style.display = 'flex';
    }
}

// Funktion zum Setzen des Overflows
function setMainBoardOverflow(hidden) {
    const mainBoard = document.querySelector('.main-board');
    if (mainBoard) {
        mainBoard.style.overflow = hidden ? 'hidden' : '';
    }
}

// Funktion zum Anzeigen der Kontaktinformationen auf kleinen Bildschirmen
function displayContactInModal(contact) {
    hideMainContent();
    openContactInfoModal(contact);
    removeActiveContactMarker();
}

// Funktion zum Anzeigen der Kontaktinformationen auf großen Bildschirmen
function displayContactInDetails(contact) {
    showMainContent();
    setMainBoardOverflow(true);
    const contactDetailsDiv = document.getElementById('contactDetails');

    if (contactDetailsDiv.classList.contains('active')) {
        transitionContactDetails(contactDetailsDiv, contact);
    } else {
        renderContactDetails(contact);
        contactDetailsDiv.classList.add('active');

        // Overflow nach Animation entfernen
        contactDetailsDiv.addEventListener('animationend', () => {
            setMainBoardOverflow(false);
        }, { once: true });
    }

    updateActiveContactMarker(contact);
}

function displayContactDetails(contact) {
    if (isSmallScreen()) {
        displayContactInModal(contact);
    } else {
        displayContactInDetails(contact);
    }
}

// Funktion zum Öffnen des Kontaktinformationen Modals
function openContactInfoModal(contact) {
    const modal = document.getElementById('contactInfoModal');
    if (modal) {
        setModalContent(modal, contact);
        addModalCloseListeners(modal);
        setupMenuOptions(modal, contact);
    }
}

function setModalContent(modal, contact) {
    modal.innerHTML = getContactInfoModalHTML(contact);
    modal.style.display = 'flex';
}

function addModalCloseListeners(modal) {
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeContactInfoModal);
    }

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeContactInfoModal();
        }
    });
}

function setupMenuOptions(modal, contact) {
    const menuOptionsBtn = modal.querySelector('.menu-contact-options');
    const dropdownOptions = modal.querySelector('.dropdown-contact-options');

    if (menuOptionsBtn && dropdownOptions) {
        addMenuButtonListener(menuOptionsBtn, dropdownOptions);
        addOutsideClickListener(dropdownOptions);
        addDropdownButtonListeners(dropdownOptions, contact);
    }
}

function addMenuButtonListener(menuOptionsBtn, dropdownOptions) {
    menuOptionsBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdownOptions.classList.toggle('show');
    });
}

function addOutsideClickListener(dropdownOptions) {
    function outsideClickListener(event) {
        if (!event.target.closest('.dropdown-contact-options') && !event.target.closest('.menu-contact-options')) {
            dropdownOptions.classList.remove('show');
            document.removeEventListener('click', outsideClickListener);
        }
    }

    document.addEventListener('click', outsideClickListener);
}

function addDropdownButtonListeners(dropdownOptions, contact) {
    const editBtn = dropdownOptions.querySelector('.edit-button');
    const deleteBtn = dropdownOptions.querySelector('.delete-button');

    if (editBtn) {
        editBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            openAddContactModal(contact);
            closeContactInfoModal();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            deleteContact(contact.key);
            closeContactInfoModal();
        });
    }
}

function closeContactInfoModal() {
    const modal = document.getElementById('contactInfoModal');
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = ''; // Inhalt zurücksetzen
    }
}

// Funktion zur Transition der Kontakt-Details
function transitionContactDetails(contactDetailsDiv, newContact) {
    setMainBoardOverflow(true);

    contactDetailsDiv.classList.remove('active');
    contactDetailsDiv.classList.add('fade-out');

    contactDetailsDiv.addEventListener('animationend', () => {
        contactDetailsDiv.classList.remove('fade-out');
        renderContactDetails(newContact);
        contactDetailsDiv.classList.add('active');

        contactDetailsDiv.addEventListener('animationend', () => {
            setMainBoardOverflow(false);
        }, { once: true });
    }, { once: true });
}


// Funktion zur Aktualisierung der aktiven Kontaktmarkierung
function updateActiveContactMarker(contact) {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 800) {
        removeActiveContactMarker();
        setActiveContactMarker(contact);
    } else {
        // Bei Bildschirmbreite unter 800px entfernen wir die aktive Markierung
        removeActiveContactMarker();
    }
}

// Funktion, um die aktive Markierung von allen Kontakten zu entfernen
const removeActiveContactMarker = () => {
    document.querySelectorAll('.contact-item').forEach(item => item.classList.remove('active-contact'));
};

// Funktion, um den aktuell ausgewählten Kontakt als aktiv zu markieren
const setActiveContactMarker = contact => {
    const currentContactElement = document.querySelector(`.contact-item[data-contact-key="${contact.key}"]`);
    if (currentContactElement) {
        currentContactElement.classList.add('active-contact');
    }
};

// Funktion zum Erhalten der Initialen des Namens
const getInitials = name => {
    if (!name || typeof name !== 'string') return '';
    const [first, second] = name.trim().split(' ');
    return `${first[0]}${second ? second[0] : ''}`.toUpperCase();
};

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
const getColor = name => {
    if (!name || typeof name !== 'string') return '#000000'; // Standardfarbe
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
};

// Funktion zum Öffnen des Add Contact Modals
function openAddContactModal(contact = null) {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        const isEditMode = !!contact;
        const contactKey = isEditMode ? contact.key : '';

        const { initials, color } = getContactInitialsAndColor(contact);
        modal.innerHTML = getContactModalHTML(contact, isEditMode, contactKey, initials, color);
        modal.style.display = 'flex';
        setupAddContactFormListener();
    }
}

// Funktion zum Generieren der Kontakt-Initialen und Farbe
const getContactInitialsAndColor = contact => contact ? {
    initials: getInitials(contact.name),
    color: getColor(contact.name)
} : { initials: '', color: '' };

// Funktion, um das Modal zu schließen
const closeAddContactModal = () => {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = ''; // Modal-Inhalt zurücksetzen
    }
};

// Funktion zum Hinzufügen eines neuen Kontakts
async function addNewContact(event) {
    event.preventDefault();

    console.log('Adding or updating contact...');

    // Formular validieren
    if (!validateForm()) {
        console.log('Form validation failed.');
        return;
    }

    // Kontakt-Daten aus dem Formular holen
    const newContact = getContactFormData();
    console.log('New Contact Data:', newContact);

    // Kontakt-Schlüssel ermitteln
    const key = getContactKey();
    console.log('Contact Key:', key);

    try {
        if (key) {
            // Bearbeitungsmodus - aktualisiere den bestehenden Kontakt
            console.log(`Updating contact with key: ${key}`);
            await updateData(`contacts/${key}`, newContact);
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
        showSuccessPopup(key ? 'edit' : 'add');
    } catch (error) {
        console.error('Error adding/updating contact:', error);
        // Optional: Zeigen Sie dem Benutzer eine Fehlermeldung an
    }
}

// Funktion, um den Kontakt-Schlüssel aus dem versteckten Input-Feld zu holen
const getContactKey = () => {
    const contactKeyInput = document.getElementById('contactKey');
    return contactKeyInput ? contactKeyInput.value : null;
};

// Funktion, um einen Kontakt zu löschen
const deleteContact = async contactKey => {
    if (contactKey) {
        try {
            await deleteData(`contacts/${contactKey}`);
            await loadContacts();
            document.getElementById('contactDetails').innerHTML = '';
        } catch (error) {
            console.error(`Error deleting contact with key ${contactKey}:`, error);
            // Optional: Zeigen Sie dem Benutzer eine Fehlermeldung an
        }
    }
};

// Funktion, um einen Kontakt von der Modal aus zu löschen
const deleteContactFromModal = async contactKey => {
    if (contactKey) {
        try {
            await deleteData(`contacts/${contactKey}`);
            await loadContacts();
            closeAddContactModal();
            document.getElementById('contactDetails').innerHTML = '';

            // Erfolgsnachricht anzeigen
            showSuccessPopup('delete');
        } catch (error) {
            console.error(`Error deleting contact from modal with key ${contactKey}:`, error);
            // Optional: Zeigen Sie dem Benutzer eine Fehlermeldung an
        }
    }
};

// Funktion zum Anzeigen des Erfolgs-Popups
function showSuccessPopup(mode) {
    const popup = document.getElementById('popupContactSuccess');
    if (popup) {
        const messages = {
            'edit': 'Contact successfully updated',
            'add': 'Contact successfully created',
            'delete': 'Contact successfully deleted'
        };
        popup.querySelector('p').textContent = messages[mode] || 'Operation successful';
        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.remove('show');
        }, 1000);
    }
}

// Funktion, um das Formular zu validieren
function validateForm() {
    const isNameValid = nameValidation();
    const isEmailValid = emailValidation();
    const isPhoneValid = phoneValidation();
    return isNameValid && isEmailValid && isPhoneValid;
}

// Funktion, um die Kontakt-Daten aus den Eingabefeldern zu holen
const getContactFormData = () => ({
    name: document.getElementById('newContactName').value.trim(),
    email: document.getElementById('newContactEmail').value.trim(),
    phone: document.getElementById('newContactPhone').value.trim()
});

// Funktion, um einen neuen Kontakt zur Kontaktliste hinzuzufügen
const addContact = contact => contacts.push(contact);

// Validierungsfunktionen ohne Parameter
function nameValidation() {
    const nameInput = document.getElementById("newContactName");
    const nameError = document.getElementById("nameError");

    if (!nameInput.value.trim()) {
        nameError.textContent = "Name cannot be empty.";
        nameError.style.display = 'flex';
        nameInput.classList.add('inputError');
        return false;
    } else {
        nameError.textContent = "";
        nameError.style.display = 'none';
        nameInput.classList.remove('inputError');
        return true;
    }
}

function emailValidation() {
    const emailInput = document.getElementById("newContactEmail");
    const emailError = document.getElementById("emailError");
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailInput.value.trim()) {
        emailError.textContent = "Email cannot be empty.";
        emailError.style.display = 'flex';
        emailInput.classList.add('inputError');
        return false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
        emailError.textContent = "Please enter a valid email address.";
        emailError.style.display = 'flex';
        emailInput.classList.add('inputError');
        return false;
    } else {
        emailError.textContent = "";
        emailError.style.display = 'none';
        emailInput.classList.remove('inputError');
        return true;
    }
}

function phoneValidation() {
    const phoneInput = document.getElementById("newContactPhone");
    const phoneError = document.getElementById("phoneError");
    const phonePattern = /^\+?[0-9]{1,3}[\s]?[0-9\s]{6,15}$/;

    if (!phoneInput.value.trim()) {
        phoneError.textContent = "Phone number cannot be empty.";
        phoneError.style.display = 'flex';
        phoneInput.classList.add('inputError');
        return false;
    } else if (!phonePattern.test(phoneInput.value.trim())) {
        phoneError.textContent = "Please enter a valid phone number.";
        phoneError.style.display = 'flex';
        phoneInput.classList.add('inputError');
        return false;
    } else {
        phoneError.textContent = "";
        phoneError.style.display = 'none';
        phoneInput.classList.remove('inputError');
        return true;
    }
}

// Funktion zum Einrichten der "Add Contact" Buttons
function setupAddContactButton() {
    const addContactButtons = document.querySelectorAll('.add-contact-button');

    addContactButtons.forEach(button => {
        button.addEventListener('click', () => openAddContactModal());
    });
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
    window.addEventListener('click', event => {
        const modal = document.getElementById('addContactModal');
        if (event.target === modal) {
            closeAddContactModal();
        }
    });
}

// Funktion zum Einrichten des Formular-Event-Listeners im Modal
function setupAddContactFormListener() {
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', addNewContact);
    }
}

// Event Listener für DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadContacts(); // Kontakte laden
    setupAddContactButton();
    setupAddContactForm();
    setupCloseModalButton();
    setupWindowClickCloseModal();
});

// Event Listener für Bearbeitungs- und Löschbuttons
// Event Listener für Bearbeitungs- und Löschbuttons
document.addEventListener('click', event => {
    const editBtn = event.target.closest('.edit-button');
    const deleteBtn = event.target.closest('.delete-button');

    if (editBtn) {
        const contactDetailsHeader = editBtn.closest('.contact-details-header');
        if (contactDetailsHeader) {
            const contactKey = contactDetailsHeader.dataset.contactKey;
            if (contactKey) {
                const contact = contacts.find(c => c.key === contactKey);
                if (contact) {
                    openAddContactModal(contact);
                    // Falls das Modal für Kontaktinformationen geöffnet ist, schließen wir es
                    closeContactInfoModal();
                }
            }
        }
    }

    if (deleteBtn) {
        const contactDetailsHeader = deleteBtn.closest('.contact-details-header');
        if (contactDetailsHeader) {
            const contactKey = contactDetailsHeader.dataset.contactKey;
            if (contactKey) {
                deleteContact(contactKey);
                // Falls das Modal für Kontaktinformationen geöffnet ist, schließen wir es
                closeContactInfoModal();
            }
        }
    }
});

window.addEventListener('resize', () => {
    if (isSmallScreen()) {
        removeActiveContactMarker();
        hideMainContent();
    } else {
        closeContactInfoModal();
        showMainContent();
    }
});
