let users = [
    {'name': 'Testuser','email': 'butterbrot@test.de', 'password': 'test12345'}
];

function register(event) {
    event.preventDefault(); // Verhindert das standardmäßige Absenden des Formulars

    // Eingabewerte abrufen
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmedPassword = document.getElementById('confirmedPassword').value;
    const checkboxSignUp = document.getElementById('checkboxSignUp').checked;

    // Validierung
    let isValid = true;

    // Vorherige Fehlermeldungen löschen
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    document.getElementById('privacyPolicyError').textContent = '';


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

    if (!isValid) {
        return; // Beendet die Funktion, wenn die Validierung fehlschlägt
    }

    // Benutzerobjekt erstellen
    const user = {
        name: name,
        email: email,
        password: password
    };

    // Benutzer aus localStorage abrufen
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Überprüfen, ob die E-Mail bereits registriert ist
    const userExists = users.some(u => u.email === email);
    if (userExists) {
        document.getElementById('emailError').textContent = 'Diese E-Mail ist bereits registriert.';
        return;
    }

    // Neuen Benutzer hinzufügen
    users.push(user);

    // Benutzer in localStorage speichern
    localStorage.setItem('users', JSON.stringify(users));

    // Erfolgsmeldung anzeigen
    alert('Registrierung erfolgreich!');

    // Formular zurücksetzen
    document.querySelector('form').reset();
}

function validateEmail(email) {
    // Einfache E-Mail-Validierung
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}