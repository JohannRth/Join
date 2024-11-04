let categoryDropdownInitialized = false;


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


function getCategoryElements() {
    return {
        categorySelector: document.getElementById('categorySelector'),
        categoryDropdown: document.getElementById('categoryDropdown'),
        dropDownImage: document.getElementById('dropDownImageCategory'),
        selectedCategory: document.getElementById('selectedCategory')
    };
}


function setupCategoryEventListeners(elements) {
    elements.categorySelector.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleCategoryDropdown(elements);
    });
}


function toggleCategoryDropdown(elements) {
    let isOpen = elements.categoryDropdown.classList.toggle('show');
    elements.dropDownImage.classList.toggle('dropDownImageRotation180', isOpen);
}


function closeCategoryDropdown(elements) {
    elements.categoryDropdown.classList.remove('show');
    elements.dropDownImage.classList.remove('dropDownImageRotation180');
}


function selectCategory(category, elements) {
    elements.selectedCategory.textContent = category;
    closeCategoryDropdown(elements);
}


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


initializeCategorySelector();


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


function toggleRotationDownImage() {
    let downImage = document.getElementById('dropDownImageCategory');
    downImage.classList.add('dropDownImageRotation180');
}