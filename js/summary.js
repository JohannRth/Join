document.addEventListener('DOMContentLoaded', function () {
    // Initialize greeting
    initializeMainGreet();
    setGreeting();

    // Update task statistics
    updateSummary();

    // Add event listeners for the links
    initializeLinkListeners();
});

/**
 * Initializes the .main-greet element and sets its display property based on the window width.
 */
function initializeMainGreet() {
    const mainGreet = document.querySelector('.main-greet');
    const debouncedUpdate = debounce(() => updateMainGreetDisplay(mainGreet), 200);

    // Initial display based on current window width
    updateMainGreetDisplay(mainGreet);

    // Event listener for the end of the animation
    mainGreet.addEventListener('animationend', (event) => handleAnimationEnd(event, mainGreet));

    // Event listener for window resize with debounce
    window.addEventListener('resize', debouncedUpdate);
}

/**
 * Updates the display property of the .main-greet element based on the window width.
 * @param {HTMLElement} mainGreet - The .main-greet DOM element.
 */
function updateMainGreetDisplay(mainGreet) {
    if (window.innerWidth > 1020) {
        mainGreet.style.display = 'flex';
        mainGreet.classList.remove('animate-hide');
    } else {
        if (mainGreet.style.display !== 'none') {
            mainGreet.style.display = 'flex';
            mainGreet.classList.add('animate-hide');
        }
    }
}

/**
 * Handles the end of the animation for the .main-greet element.
 * @param {AnimationEvent} event - The AnimationEnd event.
 * @param {HTMLElement} mainGreet - The .main-greet DOM element.
 */
function handleAnimationEnd(event, mainGreet) {
    if (event.target === mainGreet && window.innerWidth <= 1020) {
        mainGreet.style.display = 'none';
        mainGreet.classList.remove('animate-hide');
    }
}

/**
 * Sets the greeting message based on the current time of day.
 */
function setGreeting() {
    const greetTimeElement = document.querySelector('.greet-time');
    greetTimeElement.textContent = getGreeting();

    // Display username
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.name) {
        document.getElementById('greetUser').textContent = loggedInUser.name;
    } else {
        // If no user is logged in, redirect to the login page
        // window.location.href = 'index.html';
    }
}

/**
 * Generates a greeting message based on the current time.
 * @returns {string} The greeting message.
 */
function getGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning,';
    if (currentHour < 18) return 'Good afternoon,';
    return 'Good evening,';
}

/**
 * Creates a debounced version of a function that delays its execution until after the specified wait time.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} The debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Loads tasks from Firebase.
 * @returns {Promise<Array>} List of tasks.
 */
async function loadTasksFromFirebase() {
    try {
        const tasksData = await loadData("tasks");
        const tasks = Object.keys(tasksData).map((key) => {
            const task = tasksData[key];
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return {
                id: key,
                title: task.title || "Untitled",
                description: task.description || "No description",
                priority: task.prio || "low",
                dueDate: dueDate,
                category: task.category || "todo",
                assignedTo: task.assignedTo || [],
                subtasks: task.subtasks || [],
            };
        });
        return tasks;
    } catch (error) {
        console.error("Error loading tasks from Firebase:", error);
        return [];
    }
}

/**
 * Loads the positions of tasks from Firebase.
 * @returns {Promise<Object>} Positions of tasks.
 */
async function loadPositionsFromFirebase() {
    const positionsData = await loadData("positionDropArea");
    return positionsData || {};
}

/**
 * Calculates task statistics.
 * @returns {Promise<Object>} The calculated statistics.
 */
async function calculateStatistics() {
    const tasks = await loadTasksFromFirebase();
    const positions = await loadPositionsFromFirebase();

    let todoCount = 0;
    let doneCount = 0;
    let inProgressCount = 0;
    let feedbackCount = 0;
    let urgentCount = 0;
    let nearestDeadline = null;

    tasks.forEach((task) => {
        const position = positions[task.id] || "todo"; // Default to "todo" if no position is available
        // Count tasks based on their position
        if (position === "todo") {
            todoCount++;
        } else if (position === "done") {
            doneCount++;
        } else if (position === "inProgress") {
            inProgressCount++;
        } else if (position === "awaitFeedback") {
            feedbackCount++;
        }

        // Count "Urgent" tasks
        if (task.priority === "urgent") {
            urgentCount++;
            // Check due date
            if (task.dueDate) {
                if (!nearestDeadline || task.dueDate < nearestDeadline) {
                    nearestDeadline = task.dueDate;
                }
            }
        }
    });

    // Total number of tasks on the board
    const boardTaskCount = tasks.length;

    return {
        todoCount,
        doneCount,
        inProgressCount,
        feedbackCount,
        urgentCount,
        nearestDeadline,
        boardTaskCount,
    };
}

/**
 * Updates the summary statistics on the page.
 */
async function updateSummary() {
    const stats = await calculateStatistics();

    // Update DOM elements
    document.querySelector(".todo-number").innerText = stats.todoCount;
    document.querySelector(".done-number").innerText = stats.doneCount;
    document.querySelector(".urgent-number").innerText = stats.urgentCount;
    document.querySelector(".board-number").innerText = stats.boardTaskCount;
    document.querySelector(".progress-number").innerText = stats.inProgressCount;
    document.querySelector(".feedback-number").innerText = stats.feedbackCount;

    // Format and display the nearest deadline
    const datumElement = document.getElementById("datum");
    if (stats.nearestDeadline) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = stats.nearestDeadline.toLocaleDateString('de-DE', options);
        datumElement.innerText = formattedDate;
    } else {
        datumElement.innerText = "No upcoming deadlines";
    }
}

/**
 * Initializes the event listeners for the containers that redirect to 'board.html'.
 */
function initializeLinkListeners() {
    document.querySelector('.toDo-container').addEventListener('click', function () {
        window.location.href = 'board.html';
    });

    document.querySelector('.done-container').addEventListener('click', function () {
        window.location.href = 'board.html';
    });

    document.querySelector('.urgent-date-container').addEventListener('click', function () {
        window.location.href = 'board.html';
    });

    document.querySelector('.board-task-container').addEventListener('click', function () {
        window.location.href = 'board.html';
    });

    document.querySelector('.progress-task-container').addEventListener('click', function () {
        window.location.href = 'board.html';
    });

    document.querySelector('.feedback-task-container').addEventListener('click', function () {
        window.location.href = 'board.html';
    });
}
