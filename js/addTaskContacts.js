let contactDropdownInitialized = false;
let inputField = null;
let originalText = 'Select contacts to assign';


/**
 * This function initializes the assigned-to input field
 * 
 */
function initializeAssignedToInput() {
    let assignedToDiv = document.getElementById('assignedTo');
    let contactDropdown = document.getElementById('contactDropdown');
    assignedToDiv.addEventListener('click', function(event) {
        event.stopPropagation();
        if (!inputField) {
            createInputField();
        }
    });
    document.addEventListener('click', function(event) {
        if (!assignedToDiv.contains(event.target) && !contactDropdown.contains(event.target)) {
            resetContactSelection();
        }
    });
}


/**
 * This function creates an input field for searching contacts
 * 
 */
function createInputField() {
    let contactsDiv = document.getElementById('contacts');
    contactsDiv.textContent = '';
    inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.className = 'inputSearchContacts';
    contactsDiv.appendChild(inputField);
    inputField.focus();
    inputField.addEventListener('input', function() {
        filterContacts(this.value);
    });
    inputField.addEventListener('click', function(event) {
        event.stopPropagation();
        resetContactSelection();
    });
}


/**
 * This function resets the contact selection by clearing the input field and resetting the display of contacts
 * 
 */
function resetContactSelection() {
    let contactsDiv = document.getElementById('contacts');
    if (inputField) {
        contactsDiv.textContent = originalText;
        inputField = null;
    }
    filterContacts('');
    closeDropdown(getElements());
}


/**
 * This function filters the displayed contacts based on the given search term, showing or hiding them accordingly
 * 
 * @param {string} searchTerm - The term to filter contacts by
 */
function filterContacts(searchTerm) {
    let contacts = document.querySelectorAll('.contactItem');
    searchTerm = searchTerm.toLowerCase();
    contacts.forEach(contact => {
        let contactName = contact.textContent.toLowerCase();
        contact.style.display = searchTerm === '' || contactName.includes(searchTerm) ? '' : 'none';
    });
}


/**
 * This function initializes the contact dropdown
 * 
 * 
 */
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

/**
 * This function toggles the visibility of the contact dropdown
 * 
 */
function toggleContactDropdown() {
    let contactDropdown = document.getElementById('contactDropdown');
    contactDropdown.classList.toggle('show');
    if (contactDropdown.classList.contains('show') && inputField) {
        inputField.focus();
    }
}

/**
 * This function retrieves necessary DOM elements
 * 
 * @returns {Object} An object containing DOM elements
 */
function getElements() {
    return {
        assignedTo: document.getElementById('assignedTo'),
        contactDropdown: document.getElementById('contactDropdown'),
        dropDownImage: document.getElementById('dropDownImageContacts'),
    };
}

/**
 * This function sets up event listeners for the dropdown
 * 
 * @param {Object} elements - The DOM elements object
 */
function setupEventListeners(elements) {
    elements.assignedTo.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleDropdown(elements);
    });    
}

/**
 * This function toggles the dropdown's visibility
 * 
 * @param {Object} elements - The DOM elements object
 */
function toggleDropdown(elements) {
    let isOpen = elements.contactDropdown.classList.toggle('show');
    elements.dropDownImage.classList.toggle('dropDownImageRotation180', isOpen);
    if (!isOpen) {
        closeDropdown(elements);
    }
}


/**
 * This function closes the dropdown
 * 
 * @param {Object} elements - The DOM elements object 
 */
function closeDropdown(elements) {
    elements.contactDropdown.classList.remove('show');
    elements.dropDownImage.classList.remove('dropDownImageRotation180');
}


/**
 * This function prevents event propagation
 * 
 * @param {Event} event - The event object 
 */
function preventClose(event) {
    event.stopPropagation();
}


/**
 * This function handles contact selection
 * 
 * @param {string} contact - The selected contact
 */
function selectContact(contact) {
    let contactItem = event.target.closest('.contactItem');
    let checkbox = contactItem.querySelector('.contactCheckbox');
    checkbox.checked = !checkbox.checked;
    updateActiveContacts(contact, checkbox.checked);
    if (inputField) {
        inputField.focus();
    }
}

/**
 * This function updates the active contacts display
 * 
 * @param {string} contact - The contact to update
 * @param {boolean} isChecked - Whether the contact is selected
 */
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

/**
 * This function adds a contact to the dropdown
 * 
 * @param {string} contact - The contact to add
 * @param {HTMLElement} contactDropdown - The dropdown element
 */
function addContact(contact, contactDropdown, loggedInUserPlusYou = '') {
    let contactItem = document.createElement('div');
    contactItem.className = 'contactItem';
    contactItem.innerHTML = addContactTemplate(contact, loggedInUserPlusYou);
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

/**
 * This function sorts contacts alphabetically in the dropdown
 * 
 * @param {HTMLElement} container - The container element
 * @param {HTMLElement} newItem - The new item to insert
 */
function sortContactAlphabetically(container, newItem) {
    let contactName = newItem.querySelector('.contactName').textContent;
    let items = Array.from(container.querySelectorAll('.contactItem'));
    let insertIndex = items.findIndex(item => 
        item.querySelector('.contactName').textContent.localeCompare(contactName) > 0
    );
    if (insertIndex === -1) {
        container.appendChild(newItem);
    } else {
        container.insertBefore(newItem, items[insertIndex]);
    }
    moveLoggedInUserToTop(container);
}

/**
 * This function moves the logged-in user's contact item to the top of the contact list container
 * 
 * @param {HTMLElement} container - The container element holding the contact items 
 */
function moveLoggedInUserToTop(container) {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        let loggedInUserItem = Array.from(container.querySelectorAll('.contactItem'))
            .find(item => item.querySelector('.contactName').textContent.includes(loggedInUser.name));
        if (loggedInUserItem) {
            container.insertBefore(loggedInUserItem, container.firstChild);
        }
    }
}

/**
 * This function toggles the state of a contact
 * 
 * @param {HTMLElement} contactItem - The contact item element
 * @param {HTMLElement} checkbox - The checkbox element
 * @param {string} contact - The contact name
 */
function toggleContactState(contactItem, checkbox, contact) {
    contactItem.classList.toggle('active');
    checkbox.checked = contactItem.classList.contains('active');
    if (contactItem.classList.contains('active')) {
        addToActiveContacts(contact);
    } else {
        removeFromActiveContacts(contact);
    }
    
    // Fokus auf das Input-Feld setzen
    if (inputField) {
        inputField.focus();
    }
}

/**
 * This function updates the visibility of active contacts
 * 
 */
function updateAktivContactsVisibility() {
    let aktivContacts = document.getElementById('aktivContacts');
    aktivContacts.style.display = aktivContacts.children.length > 0 ? 'flex' : 'none';
}

/**
 * This function adds a contact to the active contacts display
 * 
 * @param {string} contact - The contact to add 
 */
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

/**
 * This function removes a contact from the active contacts display
 * 
 * @param {string} contact - The contact to remove
 */
function removeFromActiveContacts(contact) {
    let aktivContacts = document.getElementById('aktivContacts');
    let contactElement = aktivContacts.querySelector(`[data-contact="${contact}"]`);
    if (contactElement) {
        aktivContacts.removeChild(contactElement);
    }
    updateAktivContactsVisibility();
}

/**
 * This function gets the initials of a name
 * 
 * @param {string} name - The full name
 * @returns {string} The initials of the name 
 */
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    let nameParts = name.trim().split(' ');
    let initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

/**
 * This function gets a color based on the first letter of a name
 * 
 * @param {string} name - The name
 * @returns {string} A color in hexadecimal format
 */
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; 
    let firstLetter = name.charAt(0).toUpperCase();
    let index = firstLetter.charCodeAt(0) - 65;
    return colors[index % colors.length];
}

/**
 * This function adds the logged-in user to the contact dropdown with a special '(You)' label
 * 
 */
function addLoggedInUserToDropdown() {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.name) {
        const contactDropdown = document.getElementById('contactDropdown');
        const contactName = loggedInUser.name;
        addContact(contactName, contactDropdown, '(You)');
    }
}

/**
 * This function initializes the contact dropdown asynchronously@returns {Promise}
 * 
 *
 */
function initializeContactDropdown() {
    if (contactDropdownInitialized) return;
    let elements = getElements();
    setupEventListeners(elements);
    loadAndAddContacts(elements.contactDropdown).then(() => {
        addLoggedInUserToDropdown();
        moveLoggedInUserToTop(elements.contactDropdown);
    });
    contactDropdownInitialized = true;
    document.addEventListener('click', (event) => {
        if (!elements.assignedTo.contains(event.target) && !elements.contactDropdown.contains(event.target)) {
            closeDropdown(elements);
        }
    });
    updateAktivContactsVisibility();
}

/**
 * This function loads contacts from storage and adds them to the dropdown
 * 
 * @param {HTMLElement} contactDropdown - The dropdown element to populate@returns {Promise} 
 */
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



