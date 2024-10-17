// Array mit den Kontakten
const contacts = [
    {
        'name': 'Anton Mayer',
        'email': 'antom@gmail.com',
        'phone': '+49 176 12345678'
    },
    {
        'name': 'Anja Schulz',
        'email': 'schulz@hotmail.com',
        'phone': '+49 176 23456789'
    },
    {
        'name': 'Benedikt Ziegler',
        'email': 'benedikt@gmail.com',
        'phone': '+49 176 34567890'
    },
    {
        'name': 'David Eisenberg',
        'email': 'davidberg@gmail.com',
        'phone': '+49 176 45678901'
    },
    {
        'name': 'Eva Fischer',
        'email': 'eva@gmail.com',
        'phone': '+49 176 56789012'
    },
    {
        'name': 'Emmanuel Mauer',
        'email': 'emmanuelma@gmail.com',
        'phone': '+49 176 67890123'
    }
];

// Liste der Farben für die Icons
const colors = [
    "#FF7A00",
    "#FF5EB3",
    "#6E52FF",
    "#9327FF",
    "#00BEE8",
    "#1FD7C1",
    "#FF745E",
    "#FFA35E",
    "#FC71FF",
    "#FFC701",
    "#0038FF",
    "#C3FF2B",
    "#FFE62B",
    "#FF4646",
    "#FFBB2B"
];

// Funktion, um Kontakte zu laden
function loadContacts() {
    const contactContainer = document.getElementById('contacts');

    contacts.forEach((contact, index) => {
        const contactElement = document.createElement('div');
        contactElement.className = 'contact-item';

        // Icon erstellen
        const iconElement = document.createElement('div');
        iconElement.className = 'contact-icon';
        iconElement.textContent = getInitials(contact.name);
        iconElement.style.backgroundColor = getColor(contact.name);
        
        // Kontaktname und E-Mail erstellen
        const contactInfoElement = document.createElement('div');
        contactInfoElement.className = 'contact-info';
        contactInfoElement.innerHTML = `
            <strong>${contact.name}</strong><br>
            <span>${contact.email}</span>
        `;

        // Icon und Kontaktinformationen zum Hauptkontakt-Element hinzufügen
        contactElement.appendChild(iconElement);
        contactElement.appendChild(contactInfoElement);

        // Event-Listener für Klick auf den Kontakt
        contactElement.addEventListener('click', () => openModal(index));

        // Kontakt-Element zum Container hinzufügen
        contactContainer.appendChild(contactElement);
    });
}

// Funktion, um Initialen aus dem Namen zu erhalten
function getInitials(name) {
    const nameParts = name.split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Funktion, um eine Farbe basierend auf dem Anfangsbuchstaben zu erhalten
function getColor(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
}

// Funktion, um das Modal zu öffnen
function openModal(index) {
    const modal = document.getElementById('contactModal');
    const contact = contacts[index];
    document.getElementById('contactName').innerText = contact.name;
    document.getElementById('contactEmail').innerText = contact.email;
    document.getElementById('contactPhone').innerText = contact.phone;
    modal.style.display = 'block';
}

// Funktion, um das Modal zu schließen
function closeModal() {
    const modal = document.getElementById('contactModal');
    modal.style.display = 'none';
}

// EventListener für das Schließen des Modals
document.addEventListener('DOMContentLoaded', () => {
    const closeModalButton = document.querySelector('.close');
    closeModalButton.addEventListener('click', closeModal);
    
    // Kontakte laden
    loadContacts();
});

// Modal schließen, wenn außerhalb des Modal-Fensters geklickt wird
window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
