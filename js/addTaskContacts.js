let contactDropdownInitialized = false;


function initializeContactDropdown() {
    if (contactDropdownInitialized) return;
    let elements = getElements();
    setupEventListeners(elements);
    addExampleContacts(elements.contactDropdown);
    contactDropdownInitialized = true;
    document.addEventListener('click', (event) => {
        if (!elements.assignedTo.contains(event.target) && !elements.contactDropdown.contains(event.target)) {
            closeDropdown(elements);
        }
    });
}


function toggleContactDropdown() {
    activeContacts = document.getElementById('aktivContacts').add.classList('displayNone');

}


function getElements() {
    return {
        assignedTo: document.getElementById('assignedTo'),
        contactDropdown: document.getElementById('contactDropdown'),
        dropDownImage: document.getElementById('dropDownImageContacts'),
    };
}


function setupEventListeners(elements) {
    elements.assignedTo.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleDropdown(elements);
    });
}


function toggleDropdown(elements) {
    let isOpen = elements.contactDropdown.classList.toggle('show');
    elements.dropDownImage.classList.toggle('dropDownImageRotation180', isOpen);
}


function closeDropdown(elements) {
    elements.contactDropdown.classList.remove('show');
    elements.dropDownImage.classList.remove('dropDownImageRotation180');
}


function preventClose(event) {
    event.stopPropagation();
}



function selectContact(contact) {
    let contactItem = Event.target.closest('.contactItem');
    let checkbox = contactItem.querySelector('.contactCheckbox');
    checkbox.checked = !checkbox.checked;
    updateActiveContacts(contact, checkbox.checked);
}


function updateActiveContacts(contact, isChecked) {
    let activeContactsDiv = document.getElementById('aktivContacts');
    if (isChecked) {
        let contactElement = document.createElement('div');
        contactElement.textContent = contact;
        contactElement.setAttribute('data-contact', contact);
        activeContactsDiv.appendChild(contactElement);
    } else {
        let existingContact = activeContactsDiv.querySelector(`[data-contact="${contact}"]`);
        if (existingContact) {
            existingContact.remove();
        }
    }
}

function addContact(contact, contactDropdown) {
    let contactItem = document.createElement('div');
    contactItem.className = 'contactItem';
    contactItem.innerHTML = addContactTemplate(contact);
    let checkbox = contactItem.querySelector('.contactCheckbox');
    contactItem.addEventListener('click', (event) => {
        if (event.target !== checkbox) {
            event.preventDefault();
            toggleContactState(contactItem, checkbox, contact);}
    });
    checkbox.addEventListener('change', () => {
        toggleContactState(contactItem, checkbox, contact);
    });
    sortContactAlphabetically(contactDropdown, contactItem);
}


function sortContactAlphabetically(container, newItem) {
    let contactName = newItem.querySelector('.contactName').textContent;
    let items = container.querySelectorAll('.contactItem');
    let insertIndex = Array.from(items).findIndex(item => 
        item.querySelector('.contactName').textContent.localeCompare(contactName) > 0
    );
    if (insertIndex === -1) {
        container.appendChild(newItem);
    } else {
        container.insertBefore(newItem, items[insertIndex]);
    }
}


function toggleContactState(contactItem, checkbox, contact) {
    contactItem.classList.toggle('active');
    checkbox.checked = contactItem.classList.contains('active');
    if (contactItem.classList.contains('active')) {
        addToActiveContacts(contact);
    } else {
        removeFromActiveContacts(contact);
    }
}



function updateAktivContactsVisibility() {
    let aktivContacts = document.getElementById('aktivContacts');
    aktivContacts.style.display = aktivContacts.children.length > 0 ? 'flex' : 'none';
}


function addToActiveContacts(contact) {
    let aktivContacts = document.getElementById('aktivContacts');
    let contactElement = document.createElement('span');
    contactElement.className = 'contactIcon';
    contactElement.style.backgroundColor = getColor(contact);
    contactElement.textContent = getInitials(contact);
    contactElement.setAttribute('data-contact', contact);
    aktivContacts.appendChild(contactElement);
    updateAktivContactsVisibility();
}

function removeFromActiveContacts(contact) {
    let aktivContacts = document.getElementById('aktivContacts');
    let contactElement = aktivContacts.querySelector(`[data-contact="${contact}"]`);
    if (contactElement) {
        aktivContacts.removeChild(contactElement);
    }
    updateAktivContactsVisibility();
}

// Funktion zum Erhalten der Initialen des Namens
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    let nameParts = name.trim().split(' ');
    let initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; 
    let firstLetter = name.charAt(0).toUpperCase();
    let index = firstLetter.charCodeAt(0) - 65;
    return colors[index % colors.length];
}


async function initializeContactDropdown() {
    if (contactDropdownInitialized) return;
    let elements = getElements();
    setupEventListeners(elements);
    await loadAndAddContacts(elements.contactDropdown);
    contactDropdownInitialized = true;
    document.addEventListener('click', (event) => {
        if (!elements.assignedTo.contains(event.target) && !elements.contactDropdown.contains(event.target)) {
            closeDropdown(elements);
        }
    });
    updateAktivContactsVisibility();
}


async function loadAndAddContacts(contactDropdown) {
    try {
        const contacts = await loadData('contacts');
        Object.values(contacts).forEach(contact => {
            addContact(contact.name, contactDropdown);
        });
    } catch (error) {
        console.error('Fehler beim Laden der Kontakte:', error);
        addExampleContacts(contactDropdown);
    }
}


