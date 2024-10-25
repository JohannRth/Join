async function login(event) {
    event.preventDefault(); // Verhindert das standardmäßige Absenden des Formulars

    // Eingabewerte abrufen
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Fehlermeldungen zurücksetzen
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    document.getElementById('loginError').textContent = '';

    let isValid = true;

    // Validierung der Eingaben
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
        return; // Beendet die Funktion, wenn die Validierung fehlschlägt
    }

    try {
        // Benutzer aus Firebase abrufen
        let usersData = await loadData('users') || {};
        let users = Object.values(usersData);

        // Überprüfen, ob die E-Mail vorhanden ist
        const user = users.find(u => u.email === email);

        if (!user || user.password !== password) {
            document.getElementById('loginError').textContent = 'Email or password is incorrect.';
            return;
        }

        // Benutzernamen im localStorage speichern
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        // Login erfolgreich, Weiterleitung zur summary.html
        window.location.href = 'summary.html';
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginError').textContent = 'An error occurred during login. Please try again later.';
    }
}
