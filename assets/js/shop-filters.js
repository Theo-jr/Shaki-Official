/** 
 * This file creates and manages the dynamic filtering UI elements
 * for the shop page based on the product data
 */

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load product data
        const response = await fetch('assets/data/products.json');
        
        if (!response.ok) {
            throw new Error('Failed to load products data');
        }
        
        const data = await response.json();
        
        // Generate category filter options
        generateCategoryFilters(data.categories);
        
        // Generate featured collections
        generateFeaturedCollections(data.featured_collections);
        
    } catch (error) {
        console.error('Error initializing shop filters:', error);
    }
});

/**
 * Generate category filter checkboxes or radio buttons
 */
function generateCategoryFilters(categories) {
    if (!categories || !categories.length) return;
    
    const filterContainer = document.querySelector('.category-filters');
    
    if (!filterContainer) return;
    
    // Clear any existing filters
    filterContainer.innerHTML = '';
    
    // Add "All Products" option
    const allProductsOption = document.createElement('div');
    allProductsOption.className = 'filter-option';
    allProductsOption.innerHTML = `
        <input type="radio" id="category-all" name="category" value="all" checked>
        <label for="category-all">All Products</label>
    `;
    
    filterContainer.appendChild(allProductsOption);
    
    // Add other category options
    categories.forEach(category => {
        if (category.id === 'all') return; // Skip "all" category since we already added it
        
        const categoryOption = document.createElement('div');
        categoryOption.className = 'filter-option';
        categoryOption.innerHTML = `
            <input type="radio" id="category-${category.id}" name="category" value="${category.id}">
            <label for="category-${category.id}">${category.name}</label>
        `;
        
        filterContainer.appendChild(categoryOption);
    });
}

/**
 * Generate featured collections showcase
 */
function generateFeaturedCollections(collections) {
    if (!collections || !collections.length) return;
    
    const collectionsContainer = document.querySelector('.featured-collections');
    
    if (!collectionsContainer) return;
    
    // Clear any existing collections
    collectionsContainer.innerHTML = '';
    
    // Add collection cards
    collections.forEach(collection => {
        const collectionCard = document.createElement('div');
        collectionCard.className = 'collection-card';
        collectionCard.innerHTML = `
            <div class="collection-image">
                <img src="${collection.image}" alt="${collection.name}">
            </div>
            <div class="collection-info">
                <h3>${collection.name}</h3>
                <p>${collection.description}</p>
                <a href="collection.html?id=${collection.id}" class="btn">Shop Collection</a>
            </div>
        `;
        
        collectionsContainer.appendChild(collectionCard);
    });
}