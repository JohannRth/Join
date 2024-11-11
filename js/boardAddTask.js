function addTaskExpanded() {
    const overlay = document.getElementById('add-task-overlay');
    overlay.classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

function closeAddTaskOverlay(event) {
    const overlay = document.getElementById('add-task-overlay');
    if (event.target === overlay || event.target.classList.contains('close-btn-overlay')) {
        overlay.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();
    updateHTML();
});

// Funktion zum Abrufen einer Farbe basierend auf dem ersten Buchstaben des Namens
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; // Standardfarbe
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; // 'A' hat den charCode 65
    return colors[index % colors.length];
}