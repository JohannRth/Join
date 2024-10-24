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