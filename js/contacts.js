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

// Funktion, um Kontakte zu laden
function loadContacts() {
    const contactContainer = document.getElementById('contacts');

    contacts.forEach((contact, index) => {
        const contactElement = document.createElement('div');
        contactElement.className = 'contact-item';
        contactElement.innerHTML = `
            <strong>${contact.name}</strong><br>
            <span>${contact.email}</span>
        `;
        contactElement.addEventListener('click', () => openModal(index));
        contactContainer.appendChild(contactElement);
    });
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
