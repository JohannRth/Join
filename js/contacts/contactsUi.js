/**
 * Renders grouped contacts into the DOM.
 * @function renderGroupedContacts
 * @param {Object} groupedContacts - Object with grouped contacts.
 */
function renderGroupedContacts(groupedContacts) {
    const contactContainer = document.getElementById('contacts');
    clearContactContainer(contactContainer);

    Object.keys(groupedContacts).sort().forEach(letter => {
        addLetterHeader(contactContainer, letter);
        addSeparatorImage(contactContainer);
        addContactElements(contactContainer, groupedContacts[letter]);
    });
}

/**
 * Clears the contact container by removing all its child elements.
 * @constant
 * @type {function}
 * @param {HTMLElement} container - The DOM element to be cleared.
 */
const clearContactContainer = container => container.innerHTML = '';

/**
 * Adds a letter header to the contact container.
 * @constant
 * @type {function}
 * @param {HTMLElement} container - The contact container element.
 * @param {string} letter - The letter to be displayed as header.
 */
const addLetterHeader = (container, letter) => {
    container.insertAdjacentHTML('beforeend', `<h2 class="contact-letter-header">${letter}</h2>`);
};

/**
 * Adds a separator image to the contact container.
 * @constant
 * @type {function}
 * @param {HTMLElement} container - The contact container element.
 */
const addSeparatorImage = container => {
    container.insertAdjacentHTML('beforeend', `<img class="contact-list-separator" src="./assets/img/contacts_seperator.svg" alt="Separator-Line">`);
};

/**
 * Adds contact elements under a specific letter group.
 * @constant
 * @type {function}
 * @param {HTMLElement} container - The contact container element.
 * @param {Array<Object>} contactsGroup - Array of contacts under a specific letter.
 */
const addContactElements = (container, contactsGroup) => {
    contactsGroup.forEach(contact => {
        const contactElement = createContactElement(contact);
        container.appendChild(contactElement);
    });
};

/**
 * Creates a contact DOM element with icon and info.
 * @function createContactElement
 * @param {Object} contact - The contact object.
 * @returns {HTMLElement} The DOM element representing the contact.
 */
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

/**
 * Creates the icon element with contact initials and background color.
 * @constant
 * @type {function}
 * @param {string} name - Name of the contact.
 * @returns {HTMLElement} The DOM element representing the contact icon.
 */
const createContactIcon = name => {
    const iconElement = document.createElement('div');
    iconElement.className = 'contact-icon';
    iconElement.textContent = getInitials(name);
    iconElement.style.backgroundColor = getColor(name);
    return iconElement;
};

/**
 * Creates the contact information element with name and email.
 * @constant
 * @type {function}
 * @param {Object} contact - The contact object.
 * @returns {HTMLElement} The DOM element containing contact information.
 */
const createContactInfo = contact => {
    const contactInfoElement = document.createElement('div');
    contactInfoElement.className = 'contact-info';
    contactInfoElement.innerHTML = `
        <span class="contact-info-name">${contact.name}</span>
        <span class="contact-info-mail">${contact.email}</span>
    `;
    return contactInfoElement;
};

/**
 * Handles rendering and activating contact details when not already active.
 * @function handleInactiveContactDetails
 * @param {HTMLElement} contactDetailsDiv - The contact details DOM element.
 * @param {Object} contact - The contact object to display.
 * @returns {void}
 */
function handleInactiveContactDetails(contactDetailsDiv, contact) {
    renderContactDetails(contact);
    contactDetailsDiv.classList.add('active');
    addAnimationEndListener(contactDetailsDiv);
}

/**
 * Displays contact details based on screen size.
 * @function displayContactDetails
 * @param {Object} contact - The contact object to display.
 * @returns {void}
 */
function displayContactDetails(contact) {
    if (isSmallScreen()) {
        displayContactInModal(contact);
    } else {
        displayContactInDetails(contact);
    }
}

/**
 * Opens the Add Contact modal. If a contact is provided, it opens in edit mode.
 * @function openAddContactModal
 * @param {Object|null} [contact=null] - The contact object to edit, or null to add a new contact.
 * @returns {void}
 */
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

/**
 * Closes the Add Contact modal by hiding it and clearing its content.
 * @constant
 * @type {function}
 * @returns {void}
 */
const closeAddContactModal = () => {
    const modal = document.getElementById('addContactModal');
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = ''; // Reset modal content
    }
};

/**
 * Opens the contact information modal.
 * @function openContactInfoModal
 * @param {Object} contact - The contact object to display.
 * @returns {void}
 */
function openContactInfoModal(contact) {
    const modal = document.getElementById('contactInfoModal');
    if (modal) {
        setModalContent(modal, contact);
        addModalCloseListeners(modal);
        setupMenuOptions(modal, contact);
    }
}

/**
 * Closes the contact information modal by hiding it and clearing its content.
 * @function closeContactInfoModal
 * @returns {void}
 */
function closeContactInfoModal() {
    const modal = document.getElementById('contactInfoModal');
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = ''; // Reset content
    }
}

/**
 * Adds event listeners to handle closing the contact information modal.
 * @function addModalCloseListeners
 * @param {HTMLElement} modal - The modal DOM element.
 * @returns {void}
 */
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

/**
 * Sets up menu options within the modal, including event listeners.
 * @function setupMenuOptions
 * @param {HTMLElement} modal - The modal DOM element.
 * @param {Object} contact - The contact object related to the modal.
 * @returns {void}
 */
function setupMenuOptions(modal, contact) {
    const menuOptionsBtn = modal.querySelector('.menu-contact-options');
    const dropdownOptions = modal.querySelector('.dropdown-contact-options');

    if (menuOptionsBtn && dropdownOptions) {
        addMenuButtonListener(menuOptionsBtn, dropdownOptions);
        addDropdownButtonListeners(dropdownOptions, contact);
    }
}

/**
 * Prepares the display by showing main content and setting overflow.
 * @function prepareDisplay
 * @returns {void}
 */
function prepareDisplay() {
    showMainContent();
    setMainBoardOverflow(true);
}

/**
 * Checks if the contact details div is active.
 * @function isContactDetailsActive
 * @param {HTMLElement} contactDetailsDiv - The contact details DOM element.
 * @returns {boolean} True if active, otherwise false.
 */
function isContactDetailsActive(contactDetailsDiv) {
    return contactDetailsDiv.classList.contains('active');
}

/**
 * Handles the transition when contact details are already active.
 * @function handleActiveContactDetails
 * @param {HTMLElement} contactDetailsDiv - The contact details DOM element.
 * @param {Object} contact - The contact object to display.
 * @returns {void}
 */
function handleActiveContactDetails(contactDetailsDiv, contact) {
    transitionContactDetails(contactDetailsDiv, contact);
}

/**
 * Adds an event listener to reset overflow after animation ends.
 * @function addAnimationEndListener
 * @param {HTMLElement} contactDetailsDiv - The contact details DOM element.
 * @returns {void}
 */
function addAnimationEndListener(contactDetailsDiv) {
    contactDetailsDiv.addEventListener('animationend', () => {
        setMainBoardOverflow(false);
    }, { once: true });
}

/**
 * Handles the transition animation when updating contact details.
 * @function transitionContactDetails
 * @param {HTMLElement} contactDetailsDiv - The contact details DOM element.
 * @param {Object} newContact - The new contact object to display.
 * @returns {void}
 */
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

/**
 * Updates the active contact marker based on screen width.
 * @function updateActiveContactMarker
 * @param {Object} contact - The contact object to mark as active.
 * @returns {void}
 */
function updateActiveContactMarker(contact) {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 800) {
        removeActiveContactMarker();
        setActiveContactMarker(contact);
    } else {
        // Remove active marker for screen widths below 800px
        removeActiveContactMarker();
    }
}

/**
 * Removes the active contact marker from all contact items.
 * @constant
 * @type {function}
 * @returns {void}
 */
const removeActiveContactMarker = () => {
    document.querySelectorAll('.contact-item').forEach(item => item.classList.remove('active-contact'));
};

/**
 * Sets the active contact marker on the specified contact item.
 * @constant
 * @type {function}
 * @param {Object} contact - The contact object to mark as active.
 * @returns {void}
 */
const setActiveContactMarker = contact => {
    const currentContactElement = document.querySelector(`.contact-item[data-contact-key="${contact.key}"]`);
    if (currentContactElement) {
        currentContactElement.classList.add('active-contact');
    }
};