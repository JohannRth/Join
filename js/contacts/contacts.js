/**
 * Array to store contact objects.
 * @type {Array<Object>}
 */
let contacts = [];

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