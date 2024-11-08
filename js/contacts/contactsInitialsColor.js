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
