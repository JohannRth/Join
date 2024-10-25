async function register(event) {
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

    // Benutzer aus Firebase abrufen
    let usersData = await loadData('users') || {};
    let users = Object.values(usersData);

    // Überprüfen, ob die E-Mail bereits registriert ist
    const userExists = users.some(u => u.email === email);
    if (userExists) {
        document.getElementById('emailError').textContent = 'This email is already registered.';
        return;
    }

    // Neuen Benutzer in Firebase speichern
    await saveData('users', user);

    // Erfolgsmeldung anzeigen und Weiterleitung initiieren
    showSuccessMessage();

    // Formular zurücksetzen
    document.querySelector('form').reset();
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');

    // Nach einer bestimmten Zeit zur Login-Seite weiterleiten
    setTimeout(() => {
        // Optional: Ausblendanimation starten
        successMessage.classList.remove('show');
        // Weiterleitung zur Login-Seite
        window.location.href = 'index.html';
    }, 2000); // 2000 Millisekunden = 2 Sekunden
}
