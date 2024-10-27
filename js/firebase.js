// firebase.js

const BASE_URL = "https://remotestoragegrp377-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path = "") {
    const response = await fetch(`${BASE_URL}${path}.json`);
    const data = await response.json();
    return data || {};
}

async function saveData(path, data) {
    const response = await fetch(`${BASE_URL}${path}.json`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result; // Enthält das generierte Schlüssel-Feld 'name'
}

async function updateData(path, data) {
    await fetch(`${BASE_URL}${path}.json`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function deleteData(path) {
    await fetch(`${BASE_URL}${path}.json`, {
        method: 'DELETE'
    });
}
