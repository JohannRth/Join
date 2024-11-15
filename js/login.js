/**
 * Represents a guest user with default credentials.
 * The password can be empty or have a fixed value.
 */
const guestUser = {
    name: 'Guest',
    email: 'guest@example.com',
    password: '' // The password can be empty or have a fixed value
};

/**
 * Logs in a guest user by setting the guest user object in localStorage
 * and redirects to the summary page.
 */
function guestLogin() {
    // Set guest user as logged in
    localStorage.setItem('loggedInUser', JSON.stringify(guestUser));
    // Redirect to summary.html
    window.location.href = 'summary.html';
}

/**
 * Validates an email address using a regular expression pattern.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} Returns true if the email is valid, otherwise false.
 */
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Handles the login process for a user.
 * Validates input fields, checks credentials against Firebase data,
 * and redirects to the summary page upon successful login.
 *
 * @param {Event} event - The event object from the form submission.
 */
async function login(event) {
    event.preventDefault(); // Prevents the default form submission behavior

    // Retrieve input values
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Reset error messages
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    document.getElementById('loginError').textContent = '';

    let isValid = true;

    // Validate inputs
    if (email === '') {
        document.getElementById('loginEmailError').textContent = 'Please enter your email address.';
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('loginEmailError').textContent = 'Please enter a valid email address.';
        isValid = false;
    }

    if (password === '') {
        document.getElementById('loginPasswordError').textContent = 'Please enter your password.';
        isValid = false;
    }

    if (!isValid) {
        return; // Exit the function if validation fails
    }

    try {
        // Retrieve users from Firebase
        let usersData = await loadData('users') || {};
        let users = Object.values(usersData);

        // Check if the email exists
        const user = users.find(u => u.email === email);

        if (!user || user.password !== password) {
            document.getElementById('loginError').textContent = 'Email or password is incorrect.';
            return;
        }

        // Store the user in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        // Successful login, redirect to summary.html
        window.location.href = 'summary.html';
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginError').textContent = 'An error occurred during login. Please try again later.';
    }
}
