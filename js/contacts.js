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

// Hauptfunktion zum Laden der Kontakte
function loadContacts() {
    const contactContainer = document.getElementById('contacts');
    contacts.forEach((contact, index) => {
        const contactElement = createContactElement(contact, index);
        contactContainer.appendChild(contactElement);
    });
}

// Funktion zum Erstellen des Kontakt-Elements
function createContactElement(contact, index) {
    const contactElement = document.createElement('div');
    contactElement.className = 'contact-item';

    // Erstelle das Icon-Element und die Kontaktinformationen
    const iconElement = createContactIcon(contact.name);
    const contactInfoElement = createContactInfo(contact);

    // Icon und Kontaktinformationen zusammenfügen
    contactElement.appendChild(iconElement);
    contactElement.appendChild(contactInfoElement);

    // Event-Listener für Klick auf den Kontakt hinzufügen
    contactElement.addEventListener('click', () => openModal(index));

    return contactElement;
}

// Funktion zum Erstellen des Icons mit den Initialen
function createContactIcon(name) {
    const iconElement = document.createElement('div');
    iconElement.className = 'contact-icon';
    iconElement.textContent = getInitials(name);
    iconElement.style.backgroundColor = getColor(name);
    return iconElement;
}

// Funktion zum Erstellen der Kontaktinformationen
function createContactInfo(contact) {
    const contactInfoElement = document.createElement('div');
    contactInfoElement.className = 'contact-info';
    contactInfoElement.innerHTML = `
        <span class="contact-info-name">${contact.name}</span>
        <span class="contact-info-mail">${contact.email}</span>
    `;
    return contactInfoElement;
}

// Funktion zum Erhalten der Initialen des Namens
function getInitials(name) {
    const nameParts = name.split(' ');
    const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');
    return initials.toUpperCase();
}

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
}

// Funktion, um das Modal für einen bestimmten Kontakt zu öffnen
function openModal(index) {
    const modal = document.getElementById('contactModal');
    const contact = contacts[index];
    document.getElementById('contactName').innerText = contact.name;
    document.getElementById('contactEmail').innerText = contact.email;
    document.getElementById('contactPhone').innerText = contact.phone;
    modal.style.display = 'flex';
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
