// firebase.js

const BASE_URL = "https://remotestoragegrp377-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    let data = await response.json();
    return data || {};
}

async function saveData(path, data) {
    await fetch(BASE_URL + path + '.json', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}