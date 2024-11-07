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