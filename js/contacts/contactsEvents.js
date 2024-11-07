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