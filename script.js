/**
 * Handles the user registration process by orchestrating validation, checking for existing users,
 * saving new user data, and displaying success feedback.
 *
 * @async
 * @function register
 * @param {Event} event - The form submission event.
 * @returns {Promise<void>}
 */
async function register(event) {
    event.preventDefault(); // Prevent default form submission

    // Retrieve input values
    const { name, email, password, confirmedPassword, checkboxSignUp } = getInputValues();

    // Clear previous error messages
    clearErrorMessages();

    // Validate inputs
    const isValid = validateInputs(name, email, password, confirmedPassword, checkboxSignUp);
    if (!isValid) {
        return; // Exit if validation fails
    }

    // Check if the email is already registered
    const emailExists = await isEmailRegistered(email);
    if (emailExists) {
        displayEmailExistsError();
        return;
    }

    // Create user object
    const user = { name, email, password };

    // Save new user to Firebase
    await saveData('users', user);

    // Display success message and redirect
    showSuccessMessage();

    // Reset the form
    document.querySelector('form').reset();
}

/**
 * Retrieves input values from the registration form.
 *
 * @function getInputValues
 * @returns {Object} An object containing the form input values.
 */
function getInputValues() {
    return {
        name: document.getElementById('inputName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmedPassword: document.getElementById('confirmedPassword').value,
        checkboxSignUp: document.getElementById('checkboxSignUp').checked,
    };
}

/**
 * Clears all previous error messages from the form.
 *
 * @function clearErrorMessages
 * @returns {void}
 */
function clearErrorMessages() {
    const errorFields = ['nameError', 'emailError', 'passwordError', 'confirmPasswordError', 'privacyPolicyError'];
    errorFields.forEach(fieldId => {
        document.getElementById(fieldId).textContent = '';
    });
}

/**
 * Validates the input fields and displays error messages if validation fails.
 *
 * @function validateInputs
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @param {string} confirmedPassword - The password confirmation.
 * @param {boolean} checkboxSignUp - Whether the privacy policy checkbox is checked.
 * @returns {boolean} True if all inputs are valid, false otherwise.
 */
function validateInputs(name, email, password, confirmedPassword, checkboxSignUp) {
    let isValid = true;

    if (name === '') {
        document.getElementById('nameError').textContent = 'Please enter your name.';
        isValid = false;
    }

    if (email === '') {
        document.getElementById('emailError').textContent = 'Please enter your email address.';
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        isValid = false;
    }

    if (password === '') {
        document.getElementById('passwordError').textContent = 'Please enter a password.';
        isValid = false;
    }

    if (confirmedPassword === '') {
        document.getElementById('confirmPasswordError').textContent = 'Please confirm your password.';
        isValid = false;
    } else if (password !== confirmedPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match.';
        isValid = false;
    }

    if (!checkboxSignUp) {
        document.getElementById('privacyPolicyError').textContent = 'You must accept the Privacy Policy.';
        isValid = false;
    }

    return isValid;
}

/**
 * Checks if the provided email is already registered in Firebase.
 *
 * @async
 * @function isEmailRegistered
 * @param {string} email - The email address to check.
 * @returns {Promise<boolean>} True if the email exists, false otherwise.
 */
async function isEmailRegistered(email) {
    // Retrieve users from Firebase
    const usersData = await loadData('users') || {};
    const users = Object.values(usersData);

    // Check if the email is already registered
    return users.some(u => u.email === email);
}

/**
 * Displays an error message indicating that the email is already registered.
 *
 * @function displayEmailExistsError
 * @returns {void}
 */
function displayEmailExistsError() {
    document.getElementById('emailError').textContent = 'This email is already registered.';
}

/**
 * Validates an email address using a regular expression pattern.
 *
 * @function validateEmail
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Displays a success message and redirects the user to the login page after a delay.
 *
 * @function showSuccessMessage
 * @returns {void}
 */
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');

    // Redirect to login page after a certain time
    setTimeout(() => {
        // Optional: Start hide animation
        successMessage.classList.remove('show');
        // Redirect to login page
        window.location.href = 'index.html';
    }, 2000); // 2000 milliseconds = 2 seconds
}
