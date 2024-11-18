/**
 * Opens the "Add Task" overlay and prevents body scrolling.
 */
function addTaskExpanded() {
    const overlay = document.getElementById('add-task-overlay');
    overlay.classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

/**
 * Closes the "Add Task" overlay when the overlay background or close button is clicked.
 * @param {Event} event - The event object from the click event.
 */
function closeAddTaskOverlay(event) {
    const overlay = document.getElementById('add-task-overlay');
    if (event.target === overlay || event.target.classList.contains('close-btn-overlay')) {
        overlay.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
}

/**
 * Initializes the application once the DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", async () => {
    await loadTodosFromFirebase();
    updateHTML();
});

/**
 * Returns a color based on the provided name.
 * @param {string} name - The name from which to derive the color.
 * @returns {string} A hexadecimal color code.
 */
function getColor(name) {
    if (!name || typeof name !== 'string') return '#000000'; 
    const firstLetter = name.charAt(0).toUpperCase();
    const index = firstLetter.charCodeAt(0) - 65; 
    return colors[index % colors.length];
}

/**
 * Schließt das Add-Task-Overlay.
 * Versteckt das Overlay und aktiviert das Scrollen wieder.
 */
window.closeAddTaskOverlayAddTask = function() {
    const overlay = document.getElementById("add-task-overlay"); // Add-Task-Overlay
    if (overlay) {
        overlay.classList.add("hidden"); // Verstecke das Overlay
        document.body.classList.remove("no-scroll"); // Scrollen wieder aktivieren
    } else {
        console.warn("Add-Task-Overlay konnte nicht gefunden werden.");
    }
};

