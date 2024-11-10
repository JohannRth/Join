/**
 * Dynamically loads an HTML file and injects its content into a specified DOM element.
 * Executes an optional callback function after the HTML is successfully loaded.
 *
 * @param {string} elementID - The ID of the DOM element where the HTML content will be injected.
 * @param {string} fileName - The path to the HTML file to be loaded.
 * @param {Function} [callback] - An optional callback function to execute after the HTML is loaded.
 */
function loadHTML(elementID, fileName, callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && (this.status === 200 || this.status === 304)) {
            document.getElementById(elementID).innerHTML = this.responseText;
            if (callback) callback(); // Execute the callback function if provided
        }
    };
    xhttp.open("GET", fileName, true);
    xhttp.send();
}

// Hauptfunktion beim Laden der Seite
window.onload = function () {
    checkAuthentication();

    loadHTML("header-placeholder", "/assets/templates/header.html", function () {
        setupProfileDropdown();
        displayUserInitials();
        checkAuthentication(); // Nach dem Laden des Headers prüfen
    });

    loadHTML("sidebar-placeholder", "/assets/templates/sidebar.html", function () {
        highlightCurrentPage();
        checkAuthentication(); // Nach dem Laden der Sidebar prüfen
    });

    loadHTML("mobile-nav-placeholder", "/assets/templates/mobileNavbar.html", function () {
        highlightCurrentPageMobile(); // Funktion zum Hervorheben der aktiven Seite in der mobilen Navbar
    });
};

/**
 * Checks if a user is authenticated by verifying the presence of user data in localStorage.
 * Redirects to the login page if the user is not authenticated and is trying to access a restricted page.
 * Otherwise, hides certain UI elements meant for logged-out users.
 */
function checkAuthentication() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const currentPage = window.location.pathname.split('/').pop();
    const allowedPages = ['index.html', 'legalNotice.html', 'privacyPolicy.html'];

    if (!loggedInUser) {
        if (!allowedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        } else {
            hideElementsForLoggedOutUser();
        }
    }
}

/**
 * Hides specific UI elements that should not be visible to users who are not logged in.
 * Specifically, it hides elements with the classes 'navLinksContainer' and 'header-right'.
 */
function hideElementsForLoggedOutUser() {
    const navLinksContainers = document.querySelectorAll('.navLinksContainer');
    navLinksContainers.forEach(element => {
        element.style.display = 'none';
    });

    const headerRightElements = document.querySelectorAll('.header-right');
    headerRightElements.forEach(element => {
        element.style.display = 'none';
    });
}

/**
 * Highlights the current page's menu item by adding the 'active' class.
 * It compares the current page's filename with the 'onclick' attribute of menu items.
 */
function highlightCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop(); 
    const menuItems = document.querySelectorAll('.desktopLinkAndImage');

    menuItems.forEach(function (item) {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(page)) {
            item.classList.add('active'); 
        }
    });
}

/**
 * Highlights the current page's menu item in the mobile navigation bar by adding the 'active' class.
 * It compares the current page's filename with the 'onclick' attribute of mobile menu items.
 */
function highlightCurrentPageMobile() {
    const path = window.location.pathname;
    const page = path.split("/").pop(); 
    const mobileMenuItems = document.querySelectorAll('.mobile-nav-bar .mobile-bar');

    mobileMenuItems.forEach(function (item) {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(page)) {
            item.classList.add('active');
        }
    });
}

/**
 * Extracts initials from a full name.
 * Takes the first letters of the first two words (first name and last name) and returns them in uppercase.
 *
 * @param {string} name - The full name of the user.
 * @returns {string} The initials of the user.
 */
function getUserInitials(name) {
    const names = name.trim().split(' ');
    let initials = '';

    for (let i = 0; i < Math.min(2, names.length); i++) {
        initials += names[i].charAt(0).toUpperCase();
    }
    return initials;
}

/**
 * Displays the initials of the currently logged-in user in the profile picture area.
 * Retrieves user data from localStorage and sets the initials in the corresponding DOM element.
 * Redirects to the login page if no user is logged in.
 */
function displayUserInitials() {
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser && loggedInUser.name) {
    
        const initials = getUserInitials(loggedInUser.name);

        const profilePictureDiv = document.getElementById('profilePicture');

        if (profilePictureDiv) {
            profilePictureDiv.textContent = initials;
        }
    } else {
        //activate if you dosn´t won´t to share privacyPolicy or legalNotice--> window.location.href = 'index.html';
    }
}

/**
 * Sets up the dropdown menu for the user profile.
 * Adds event listeners to toggle the dropdown menu visibility when clicking on the profile picture.
 * Closes the dropdown menu when clicking outside of it.
 */
function setupProfileDropdown() {
    const profilePicture = document.getElementById("profilePicture");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const arrowLeft = document.querySelector(".arrowLeft");

    if (profilePicture && dropdownMenu) {
        profilePicture.addEventListener("click", function (event) {
            event.stopPropagation();

            if (dropdownMenu.style.display === "none" || dropdownMenu.style.display === "") {
                dropdownMenu.style.display = "block";

                if (arrowLeft) {
                    arrowLeft.style.display = "none";
                }
            } else {
                dropdownMenu.style.display = "none";

                if (arrowLeft) {
                    arrowLeft.style.display = "block";
                }
            }
        });

        document.addEventListener("click", function () {
            if (dropdownMenu.style.display === "block") {
                dropdownMenu.style.display = "none";

                if (arrowLeft) {
                    arrowLeft.style.display = "block";
                }
            }
        });
    }
}

/**
 * Logs out the currently authenticated user.
 * Removes the user data from localStorage and redirects to the login page.
 */
function logout() {
    
    localStorage.removeItem('loggedInUser');
    
    window.location.href = 'index.html';
}
