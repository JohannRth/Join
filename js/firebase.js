const BASE_URL = "https://remotestoragegrp377-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Loads data from the specified path in the Firebase Realtime Database.
 *
 * @param {string} [path=""] - The path in the database to load data from.
 * @returns {Promise<Object>} A promise that resolves to the loaded data or an empty object if no data is found.
 */
async function loadData(path = "") {
    const response = await fetch(`${BASE_URL}${path}.json`);
    const data = await response.json();
    return data || {};
}

/**
 * Saves data to the specified path in the Firebase Realtime Database.
 * Uses the POST method to add new data to a collection.
 *
 * @param {string} path - The path in the database where the data should be saved.
 * @param {Object} data - The data object to be saved.
 * @returns {Promise<Object>} A promise that resolves to the result object containing the generated key (e.g., 'name').
 */
async function saveData(path, data) {
    const response = await fetch(`${BASE_URL}${path}.json`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result; // Contains the generated key field 'name'
}

/**
 * Updates data at the specified path in the Firebase Realtime Database.
 * Uses the PUT method to overwrite existing data at the specified path.
 *
 * @param {string} path - The path in the database where the data should be updated.
 * @param {Object} data - The data object to update with.
 * @returns {Promise<void>} A promise that resolves when the data has been updated.
 */
async function updateData(path, data) {
    await fetch(`${BASE_URL}${path}.json`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Deletes data at the specified path in the Firebase Realtime Database.
 *
 * @param {string} path - The path in the database where the data should be deleted.
 * @returns {Promise<void>} A promise that resolves when the data has been deleted.
 */
async function deleteData(path) {
    await fetch(`${BASE_URL}${path}.json`, {
        method: 'DELETE'
    });
}