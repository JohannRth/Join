// Funktion zum dynamischen Laden von HTML-Dateien
function loadHTML(elementID, fileName) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById(elementID).innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", fileName, true);
    xhttp.send();
}

// Lade die Header- und Sidebar-Dateien nach dem Laden der Seite
window.onload = function () {
    loadHTML("header-placeholder", "/assets/templates/header.html");
    loadHTML("sidebar-placeholder", "/assets/templates/sidebar.html");
};