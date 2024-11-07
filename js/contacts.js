/**
 * Array to store contact objects.
 * @type {Array<Object>}
 */
let contacts = [];

/**
 * List of colors used for contact icons.
 * @type {string[]}
 */
const colors = [
    "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8",
    "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701",
    "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"
];

/**
 * Loads contacts, parses them, groups them alphabetically, and renders them.
 * @async
 * @function loadContacts
 * @returns {Promise<void>}
 */
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

/**
 * Parses raw contact data into a structured array of contact objects.
 * @function parseContactsData
 * @param {Object} data - Raw contact data fetched from the data source.
 * @returns {Array<Object>} Parsed array of contact objects.
 */
function parseContactsData(data) {
    const parsedContacts = [];
    if (data) {
        for (const [key, contact] of Object.entries(data)) {
            if (contact.name) {
                parsedContacts.push({ key, ...contact });
            } else {
                console.warn(`Contact with key ${key} has no name and will be skipped.`);
            }
        }
    }
    return parsedContacts;
}

/**
 * Groups contacts alphabetically after sorting them.
 * @function groupContactsByAlphabet
 * @returns {Object} An object where keys are first letters and values are arrays of contacts.
 */
function groupContactsByAlphabet() {
    contacts.sort(contactComparator);
    return groupContactsByFirstLetter(contacts);
}

/**
 * Groups contacts based on the first letter of their names.
 * @function groupContactsByFirstLetter
 * @param {Array<Object>} contactsList - Array of contact objects to be grouped.
 * @returns {Object} An object with first letters as keys and arrays of contacts as values.
 */
function groupContactsByFirstLetter(contactsList) {
    return contactsList.reduce((groups, contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        groups[firstLetter] = groups[firstLetter] || [];
        groups[firstLetter].push(contact);
        return groups;
    }, {});
}

/**
 * Comparator function to sort contacts by first and last initials and then by name.
 * @function contactComparator
 * @param {Object} a - First contact object to compare.
 * @param {Object} b - Second contact object to compare.
 * @returns {number} Negative if a < b, positive if a > b, zero if equal.
 */
function contactComparator(a, b) {
    const aInitials = getFirstAndLastInitials(a.name);
    const bInitials = getFirstAndLastInitials(b.name);

    return aInitials.firstInitial.localeCompare(bInitials.firstInitial) ||
        aInitials.lastInitial.localeCompare(bInitials.lastInitial) ||
        a.name.localeCompare(b.name);
}

/**
 * Extracts the first and last initials from a given name.
 * @function getFirstAndLastInitials
 * @param {string} name - Full name of the contact.
 * @returns {Object} An object containing the first and last initials.
 */
function getFirstAndLastInitials(name) {
    const [firstName, lastName = ''] = name.split(' ');
    return {
        firstInitial: firstName.charAt(0).toUpperCase(),
        lastInitial: lastName.charAt(0).toUpperCase()
    };
}

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
 * Checks if the current screen width is considered small.
 * @function isSmallScreen
 * @returns {boolean} True if screen width is less than 800px, otherwise false.
 */
function isSmallScreen() {
    return window.innerWidth < 800;
}

/**
 * Hides the main content area.
 * @function hideMainContent
 * @returns {void}
 */
function hideMainContent() {
    const mainBoardContent = document.querySelector('.main-board-content');
    if (mainBoardContent) {
        mainBoardContent.style.display = 'none';
    }
}

/**
 * Shows the main content area.
 * @function showMainContent
 * @returns {void}
 */
function showMainContent() {
    const mainBoardContent = document.querySelector('.main-board-content');
    if (mainBoardContent) {
        mainBoardContent.style.display = 'flex';
    }
}

/**
 * Sets the overflow property of the main board.
 * @function setMainBoardOverflow
 * @param {boolean} hidden - Whether to hide the overflow.
 * @returns {void}
 */
function setMainBoardOverflow(hidden) {
    const mainBoard = document.querySelector('.main-board');
    if (mainBoard) {
        mainBoard.style.overflow = hidden ? 'hidden' : '';
    }
}

/**
 * Displays contact information in a modal for small screens.
 * @function displayContactInModal
 * @param {Object} contact - The contact object to display.
 * @returns {void}
 */
function displayContactInModal(contact) {
    hideMainContent();
    openContactInfoModal(contact);
    removeActiveContactMarker();
}

/**
 * Displays contact information in the details section for large screens.
 * @function displayContactInDetails
 * @param {Object} contact - The contact object to display.
 * @returns {void}
 */
function displayContactInDetails(contact) {
    prepareDisplay();
    const contactDetailsDiv = document.getElementById('contactDetails');

    if (isContactDetailsActive(contactDetailsDiv)) {
        handleActiveContactDetails(contactDetailsDiv, contact);
    } else {
        handleInactiveContactDetails(contactDetailsDiv, contact);
    }

    updateActiveContactMarker(contact);
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
 * Sets the content of the contact information modal.
 * @function setModalContent
 * @param {HTMLElement} modal - The modal DOM element.
 * @param {Object} contact - The contact object to display.
 * @returns {void}
 */
function setModalContent(modal, contact) {
    modal.innerHTML = getContactInfoModalHTML(contact);
    modal.style.display = 'flex';
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
 * Adds a listener to the menu button to toggle the dropdown menu.
 * @function addMenuButtonListener
 * @param {HTMLElement} menuOptionsBtn - The menu button DOM element.
 * @param {HTMLElement} dropdownOptions - The dropdown menu DOM element.
 * @returns {void}
 */
function addMenuButtonListener(menuOptionsBtn, dropdownOptions) {
    /**
     * Shows the dropdown menu and adds an outside click listener.
     * @function showMenu
     */
    function showMenu() {
        dropdownOptions.classList.add('show');
        addOutsideClickListener();
    }

    /**
     * Hides the dropdown menu and removes the outside click listener.
     * @function hideMenu
     */
    function hideMenu() {
        dropdownOptions.classList.remove('show');
        removeOutsideClickListener();
    }

    /**
     * Toggles the dropdown menu's visibility.
     * @function toggleMenu
     * @param {Event} event - The click event.
     */
    function toggleMenu(event) {
        event.stopPropagation();
        if (dropdownOptions.classList.contains('show')) {
            hideMenu();
        } else {
            showMenu();
        }
    }

    /**
     * Adds an event listener to detect clicks outside the dropdown menu.
     * @function addOutsideClickListener
     */
    function addOutsideClickListener() {
        document.addEventListener('click', outsideClickListener);
    }

    /**
     * Removes the outside click event listener.
     * @function removeOutsideClickListener
     */
    function removeOutsideClickListener() {
        document.removeEventListener('click', outsideClickListener);
    }

    /**
     * Handles clicks outside the dropdown menu to hide it.
     * @function outsideClickListener
     * @param {Event} event - The click event.
     */
    function outsideClickListener(event) {
        if (!event.target.closest('.dropdown-contact-options') && !event.target.closest('.menu-contact-options')) {
            hideMenu();
        }
    }

    // Add the toggleMenu event listener to the menu button
    menuOptionsBtn.addEventListener('click', toggleMenu);
}

/**
 * Adds an outside click listener to hide the dropdown menu when clicking outside.
 * @function addOutsideClickListener
 * @param {HTMLElement} dropdownOptions - The dropdown menu DOM element.
 * @returns {void}
 */
function addOutsideClickListener(dropdownOptions) {
    /**
     * Handles clicks outside the dropdown menu to hide it.
     * @function outsideClickListener
     * @param {Event} event - The click event.
     */
    function outsideClickListener(event) {
        if (!event.target.closest('.dropdown-contact-options') && !event.target.closest('.menu-contact-options')) {
            dropdownOptions.classList.remove('show');
            document.removeEventListener('click', outsideClickListener);
        }
    }

    document.addEventListener('click', outsideClickListener);
}

/**
 * Adds listeners to the dropdown menu buttons (edit and delete).
 * @function addDropdownButtonListeners
 * @param {HTMLElement} dropdownOptions - The dropdown menu DOM element.
 * @param {Object} contact - The contact object related to the dropdown menu.
 * @returns {void}
 */
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

/**
 * Retrieves the initials from a given name.
 * @constant
 * @type {function}
 * @param {string} name - The full name of the contact.
 * @returns {string} The initials of the contact.
 */
const getInitials = name => {
    if (!name || typeof name !== 'string') return '';
    const [first, second] = name.trim().split(' ');
    return `${first[0]}${second ? second[0] : ''}`.toUpperCase();
};

/**
 * Determines a color based on the first letter of the contact's name.
 * @constant
 * @type {function}
 * @param {string} name - The full name of the contact.
 * @returns {string} A HEX color code.
 */
const getColor = name => {
    if (!name || typeof name !== 'string') return '#000000'; // Default color
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' has charCode 65
    return colors[index % colors.length];
};

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
 * Generates the initials and color for a contact.
 * @constant
 * @type {function}
 * @param {Object|null} contact - The contact object or null.
 * @returns {Object} An object containing initials and color.
 */
const getContactInitialsAndColor = contact => contact ? {
    initials: getInitials(contact.name),
    color: getColor(contact.name)
} : { initials: '', color: '' };

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
 * Adds a new contact or updates an existing contact based on form input.
 * @async
 * @function addNewContact
 * @param {Event} event - The form submission event.
 * @returns {Promise<void>}
 */
async function addNewContact(event) {
    event.preventDefault();

    const { isValid, newContact } = validateAndGetContactData();
    if (!isValid) return;

    const key = getContactKey();

    try {
        await saveOrUpdateContact(key, newContact);
        await handlePostSaveActions();
        displayUpdatedContact(key, newContact);
        handleSuccess(key);
    } catch (error) {
        console.error('Error adding/updating contact:', error);
    }
}

/**
 * Validates the form and retrieves the contact data.
 * @function validateAndGetContactData
 * @returns {Object} An object containing validation status and contact data.
 */
function validateAndGetContactData() {
    if (!validateForm()) {
        return { isValid: false };
    }
    const newContact = getContactFormData();
    return { isValid: true, newContact };
}

/**
 * Saves a new contact or updates an existing contact in the data source.
 * @async
 * @function saveOrUpdateContact
 * @param {string|null} key - The key of the contact to update, or null to add a new contact.
 * @param {Object} newContact - The contact data to save or update.
 * @returns {Promise<void>}
 */
async function saveOrUpdateContact(key, newContact) {
    if (key) {
        // Edit mode - update existing contact
        await updateData(`contacts/${key}`, newContact);
    } else {
        // Add mode - add new contact
        const result = await saveData('contacts', newContact);
        newContact.key = result.name; // Generated key from Firebase
    }
}

/**
 * Performs post-save actions such as reloading contacts and closing the modal.
 * @async
 * @function handlePostSaveActions
 * @returns {Promise<void>}
 */
async function handlePostSaveActions() {
    await loadContacts();
    closeAddContactModal();
}

/**
 * Displays the updated contact details in the UI.
 * @function displayUpdatedContact
 * @param {string|null} key - The key of the contact to display.
 * @param {Object} newContact - The contact object that was added or updated.
 * @returns {void}
 */
function displayUpdatedContact(key, newContact) {
    const updatedContact = contacts.find(c => c.key === (key || newContact.key));
    if (updatedContact) {
        displayContactDetails(updatedContact);
    } else {
        console.warn('Updated contact not found.');
        // Optional: Additional handling if contact not found
    }
}

/**
 * Displays a success popup message based on the operation performed.
 * @function handleSuccess
 * @param {string} key - The key of the contact, used to determine the operation type.
 * @returns {void}
 */
function handleSuccess(key) {
    showSuccessPopup(key ? 'edit' : 'add');
}

/**
 * Retrieves the contact key from the hidden input field in the form.
 * @constant
 * @type {function}
 * @returns {string|null} The contact key or null if not found.
 */
const getContactKey = () => {
    const contactKeyInput = document.getElementById('contactKey');
    return contactKeyInput ? contactKeyInput.value : null;
};

/**
 * Deletes a contact from the data source and reloads contacts.
 * @async
 * @constant
 * @type {function}
 * @param {string} contactKey - The key of the contact to delete.
 * @returns {Promise<void>}
 */
const deleteContact = async contactKey => {
    if (contactKey) {
        try {
            await deleteData(`contacts/${contactKey}`);
            await loadContacts();
            document.getElementById('contactDetails').innerHTML = '';
        } catch (error) {
            console.error(`Error deleting contact with key ${contactKey}:`, error);
            // Optional: Display an error message to the user
        }
    }
};

/**
 * Deletes a contact from the modal view and performs necessary actions.
 * @async
 * @constant
 * @type {function}
 * @param {string} contactKey - The key of the contact to delete.
 * @returns {Promise<void>}
 */
const deleteContactFromModal = async contactKey => {
    if (contactKey) {
        try {
            await deleteData(`contacts/${contactKey}`);
            await loadContacts();
            closeAddContactModal();
            document.getElementById('contactDetails').innerHTML = '';

            // Show success message
            showSuccessPopup('delete');
        } catch (error) {
            console.error(`Error deleting contact from modal with key ${contactKey}:`, error);
            // Optional: Display an error message to the user
        }
    }
};

/**
 * Shows a success popup message based on the operation mode.
 * @function showSuccessPopup
 * @param {string} mode - The mode of operation ('edit', 'add', 'delete').
 * @returns {void}
 */
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

/**
 * Validates the contact form by checking name, email, and phone fields.
 * @function validateForm
 * @returns {boolean} True if all validations pass, otherwise false.
 */
function validateForm() {
    const isNameValid = nameValidation();
    const isEmailValid = emailValidation();
    const isPhoneValid = phoneValidation();
    return isNameValid && isEmailValid && isPhoneValid;
}

/**
 * Retrieves contact data from the form input fields.
 * @constant
 * @type {function}
 * @returns {Object} An object containing name, email, and phone of the contact.
 */
const getContactFormData = () => ({
    name: document.getElementById('newContactName').value.trim(),
    email: document.getElementById('newContactEmail').value.trim(),
    phone: document.getElementById('newContactPhone').value.trim()
});

/**
 * Adds a new contact to the contacts array.
 * @constant
 * @type {function}
 * @param {Object} contact - The contact object to add.
 * @returns {void}
 */
const addContact = contact => contacts.push(contact);

/**
 * Validates the name input field.
 * @function nameValidation
 * @returns {boolean} True if valid, otherwise false.
 */
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

/**
 * Validates the email input field.
 * @function emailValidation
 * @returns {boolean} True if valid, otherwise false.
 */
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

/**
 * Validates the phone input field.
 * @function phoneValidation
 * @returns {boolean} True if valid, otherwise false.
 */
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

/**
 * Sets up event listeners for all "Add Contact" buttons.
 * @function setupAddContactButton
 * @returns {void}
 */
function setupAddContactButton() {
    const addContactButtons = document.querySelectorAll('.add-contact-button');

    addContactButtons.forEach(button => {
        button.addEventListener('click', () => openAddContactModal());
    });
}

/**
 * Sets up the form submission listener for adding a new contact.
 * @function setupAddContactForm
 * @returns {void}
 */
function setupAddContactForm() {
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', addNewContact);
    }
}

/**
 * Sets up the close button listener for the Add Contact modal.
 * @function setupCloseModalButton
 * @returns {void}
 */
function setupCloseModalButton() {
    const closeModalButton = document.querySelector('.close');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeAddContactModal);
    }
}

/**
 * Sets up an event listener to close the Add Contact modal when clicking outside of it.
 * @function setupWindowClickCloseModal
 * @returns {void}
 */
function setupWindowClickCloseModal() {
    window.addEventListener('click', event => {
        const modal = document.getElementById('addContactModal');
        if (event.target === modal) {
            closeAddContactModal();
        }
    });
}

/**
 * Sets up the form submission listener within the Add Contact modal.
 * @function setupAddContactFormListener
 * @returns {void}
 */
function setupAddContactFormListener() {
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', addNewContact);
    }
}

/**
 * Initializes the application by loading contacts and setting up event listeners.
 * @event DOMContentLoaded
 * @fires loadContacts
 * @fires setupAddContactButton
 * @fires setupAddContactForm
 * @fires setupCloseModalButton
 * @fires setupWindowClickCloseModal
 */
document.addEventListener('DOMContentLoaded', () => {
    loadContacts(); // Load contacts
    setupAddContactButton();
    setupAddContactForm();
    setupCloseModalButton();
    setupWindowClickCloseModal();
});

/**
 * Handles click events for edit and delete buttons within the contact details.
 * @event click
 * @param {Event} event - The click event.
 */
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
                    // Close the contact information modal if open
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
                // Close the contact information modal if open
                closeContactInfoModal();
            }
        }
    }
});

/**
 * Handles window resize events to adjust the UI based on screen size.
 * @event resize
 * @param {Event} event - The resize event.
 */
window.addEventListener('resize', () => {
    if (isSmallScreen()) {
        removeActiveContactMarker();
        hideMainContent();
    } else {
        closeContactInfoModal();
        showMainContent();
    }
});
