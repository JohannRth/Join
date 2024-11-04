let categoryDropdownInitialized = false;

/**
 * This function initializes the category dropdown
 * 
 */
function initializeCategoryDropdown() {
    if (categoryDropdownInitialized) return;
    let elements = getCategoryElements();
    setupCategoryEventListeners(elements);
    addCategoryOptions(elements.categoryDropdown);
    categoryDropdownInitialized = true;
    document.addEventListener('click', (event) => {
        if (!elements.categorySelector.contains(event.target) && !elements.categoryDropdown.contains(event.target)) {
            closeCategoryDropdown(elements);
        }
    });
}

/**
 * This function retrieves the necessary DOM elements for the category dropdown
 * 
 *@returns {Object} An object containing references to the category-related DOM elements
 */
function getCategoryElements() {
    return {
        categorySelector: document.getElementById('categorySelector'),
        categoryDropdown: document.getElementById('categoryDropdown'),
        dropDownImage: document.getElementById('dropDownImageCategory'),
        selectedCategory: document.getElementById('selectedCategory')
    };
}

/**
 * This function sets up event listeners for the category dropdown
 * 
 * @param {Object} elements - The object containing references to category-related DOM elements 
 */
function setupCategoryEventListeners(elements) {
    elements.categorySelector.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleCategoryDropdown(elements);
    });
}

/**
 * This function toggles the visibility of the category dropdown
 * 
 * @param {Object} elements - The object containing references to category-related DOM elements
 */
function toggleCategoryDropdown(elements) {
    let isOpen = elements.categoryDropdown.classList.toggle('show');
    elements.dropDownImage.classList.toggle('dropDownImageRotation180', isOpen);
}

/**
 * This function closes the category dropdown
 * 
 * @param {Object} elements - The object containing references to category-related DOM elements
 */
function closeCategoryDropdown(elements) {
    elements.categoryDropdown.classList.remove('show');
    elements.dropDownImage.classList.remove('dropDownImageRotation180');
}

/**
 * This function selects a category and updates the UI
 * 
 * @param {string} category - The selected category 
 * @param {Object} elements - The object containing references to category-related DOM elements
 */
function selectCategory(category, elements) {
    elements.selectedCategory.textContent = category;
    closeCategoryDropdown(elements);
}

/**
 * This function initializes the category selector with event listeners
 * 
 */
function initializeCategorySelector() {
    let categorySelector = document.getElementById('categorySelector');
    categorySelector.addEventListener('click', function(event) {
        let selectedCategory = this.querySelector('#selectedCategory');
        if (selectedCategory.textContent !== 'Select task category') {
            event.stopPropagation();
            resetCategorySelector();
        }
    });
}


/**
 * This function resets the category selector to its default state
 * 
 */
function resetCategorySelector() {
    let selectedCategory = document.getElementById('selectedCategory');
    selectedCategory.textContent = 'Select task category';
    let categoryItems = document.querySelectorAll('.categoryItem');
    categoryItems.forEach(item => item.classList.remove('active'));
    let categoryDropdown = document.getElementById('categoryDropdown');
    categoryDropdown.classList.remove('show');
    let dropDownImage = document.getElementById('dropDownImageCategory');
    dropDownImage.classList.remove('dropDownImageRotation180');
}


document.addEventListener('DOMContentLoaded', function() {
    initializeCategoryDropdown();
});


/**
 * This function adds category options to the dropdown
 * 
 * @param {HTMLElement} categoryDropdown - The dropdown element to populate with options 
 */
function addCategoryOptions(categoryDropdown) {
    const categories = ['Technical Task', 'User Story'];
    categories.forEach(category => {
        let categoryItem = document.createElement('div');
        categoryItem.className = 'categoryItem';
        categoryItem.textContent = category;
        categoryItem.addEventListener('click', (event) => {
            event.stopPropagation();
            selectCategory(category, getCategoryElements());
        });
        categoryDropdown.appendChild(categoryItem);
    });
}


let isDropdownOpen = false;

/**
 * This function toggles the rotation of the dropdown image
 * 
 */
function toggleRotationDownImage() {
    let downImage = document.getElementById('dropDownImageCategory');
    downImage.classList.add('dropDownImageRotation180');
}