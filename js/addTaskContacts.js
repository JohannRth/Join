let contactDropdownInitialized = false;


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
    activeContacts = document.getElementById('aktivContacts').add.classList('displayNone');

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
    let contactItem = Event.target.closest('.contactItem');
    let checkbox = contactItem.querySelector('.contactCheckbox');
    checkbox.checked = !checkbox.checked;
    updateActiveContacts(contact, checkbox.checked);
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


/**
 * This function sorts contacts alphabetically in the dropdown
 * 
 * @param {HTMLElement} container - The container element
 * @param {HTMLElement} newItem - The new item to insert
 */
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


