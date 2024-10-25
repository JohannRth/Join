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

// Lade die Header- und Sidebar-Dateien nach dem Laden der Seite
window.onload = function () {
    loadHTML("header-placeholder", "/assets/templates/header.html");
    loadHTML("sidebar-placeholder", "/assets/templates/sidebar.html", highlightCurrentPage);
};

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

window.onload = function () {
    loadHTML("header-placeholder", "/assets/templates/header.html", function() {
        displayUserInitials();
    });
    loadHTML("sidebar-placeholder", "/assets/templates/sidebar.html", function() {
        highlightCurrentPage();
    });
};

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
        //muss wieder aktiviert werden --> window.location.href = 'index.html';
    }
}