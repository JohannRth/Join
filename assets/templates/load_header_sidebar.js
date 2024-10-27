// Funktion zum dynamischen Laden von HTML-Dateien mit einer Callback-Funktion
function loadHTML(elementID, fileName, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById(elementID).innerHTML = this.responseText;
            if (callback) callback(); // Führe die Callback-Funktion aus, falls vorhanden
        }
    };
    xhttp.open("GET", fileName, true);
    xhttp.send();
}

// Hauptfunktion beim Laden der Seite
window.onload = function () {
    checkAuthentication();

    loadHTML("header-placeholder", "/assets/templates/header.html", function() {
        setupProfileDropdown(); 
        displayUserInitials();
        checkAuthentication(); // Nach dem Laden des Headers prüfen
    });

    loadHTML("sidebar-placeholder", "/assets/templates/sidebar.html", function() {
        highlightCurrentPage();
        checkAuthentication(); // Nach dem Laden der Sidebar prüfen
    });
};

// Authentifizierungsprüfung
function checkAuthentication() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const currentPage = window.location.pathname.split('/').pop();
    const allowedPages = ['index.html', 'legal_notice.html', 'privacy_policy.html'];

    if (!loggedInUser) {
        if (!allowedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        } else {
            hideElementsForLoggedOutUser();
        }
    }
}

// Elemente für ausgeloggte Benutzer ausblenden
function hideElementsForLoggedOutUser() {
    // Elemente mit der Klasse 'navLinksContainer' ausblenden
    const navLinksContainers = document.querySelectorAll('.navLinksContainer');
    navLinksContainers.forEach(element => {
        element.style.display = 'none';
    });

    // Elemente mit der Klasse 'header-right' ausblenden
    const headerRightElements = document.querySelectorAll('.header-right');
    headerRightElements.forEach(element => {
        element.style.display = 'none';
    });
}

// Funktion zum Hervorheben der aktuellen Seite im Menü
function highlightCurrentPage() {
    var path = window.location.pathname;
    var page = path.split("/").pop(); // Holt den aktuellen Seitennamen (z.B. 'summary.html')
    var menuItems = document.querySelectorAll('.desktopLinkAndImage');

    menuItems.forEach(function(item) {
        var onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(page)) {
            item.classList.add('active'); // Fügt die 'active'-Klasse hinzu, um das Menüelement hervorzuheben
        }
    });
}

function getUserInitials(name) {
    const names = name.trim().split(' ');
    let initials = '';

    // Nimmt die ersten beiden Wörter (Vorname und Nachname)
    for (let i = 0; i < Math.min(2, names.length); i++) {
        initials += names[i].charAt(0).toUpperCase();
    }
    return initials;
}

function displayUserInitials() {
    // Benutzerdaten aus dem localStorage abrufen
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser && loggedInUser.name) {
        // Initialen extrahieren
        const initials = getUserInitials(loggedInUser.name);

        // Element für die Profilbild-Anzeige finden
        const profilePictureDiv = document.getElementById('profilePicture');

        if (profilePictureDiv) {
            // Initialen setzen
            profilePictureDiv.textContent = initials;
        }
    } else {
        // Falls kein Benutzer eingeloggt ist, Weiterleitung zur Login-Seite
/////////////////// muss wieder aktiviert werden wenn die seite abgegeben wird --> window.location.href = 'index.html';
    }
}

// Funktionen zum Dropdown-Menü
function setupProfileDropdown() {
    const profilePicture = document.getElementById("profilePicture");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const arrowLeft = document.querySelector(".arrowLeft"); 

    if (profilePicture && dropdownMenu) {
        profilePicture.addEventListener("click", function(event) {
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

        document.addEventListener("click", function() {
            if (dropdownMenu.style.display === "block") {
                dropdownMenu.style.display = "none";

                if (arrowLeft) {
                    arrowLeft.style.display = "block";
                }
            }
        });
    }
}

// Logout-Funktion
function logout() {
    // Entfernen des Benutzers aus dem localStorage
    localStorage.removeItem('loggedInUser');
    // Weiterleitung zur Login-Seite
    window.location.href = 'index.html';
}
