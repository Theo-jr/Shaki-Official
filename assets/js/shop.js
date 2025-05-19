/**
 * Shaki E-commerce Shop Functionality
 * 
 * This file handles all e-commerce related functionality for the Shaki website:
 * - Product filtering and sorting
 * - Shopping cart management
 * - Checkout process
 * - Wishlist functionality
 */

// Initialize the shop module
const ShakiShop = (function() {
    // Private variables
    let cart = [];
    let wishlist = [];
    let products = [];
    let currentFilters = {
        category: 'all',
        priceRange: { min: 0, max: Infinity },
        sortBy: 'newest'
    };

    // DOM elements (will be populated after DOM loads)
    let elements = {
        productContainer: null,
        cartCounter: null,
        cartItems: null,
        cartTotal: null,
        filterForm: null,
        sortSelector: null,
        wishlistCounter: null
    };

    /**
     * Product class for managing product data
     */
    class Product {
        constructor(id, name, price, category, images, description, sizes, colors, isNew = false, isFeatured = false) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.category = category;
            this.images = images;
            this.description = description;
            this.sizes = sizes;
            this.colors = colors;
            this.isNew = isNew;
            this.isFeatured = isFeatured;
        }
    }

    /**
     * CartItem class for managing cart items
     */
    class CartItem {
        constructor(product, quantity = 1, size = null, color = null) {
            this.product = product;
            this.quantity = quantity;
            this.size = size;
            this.color = color;
        }

        get total() {
            return this.product.price * this.quantity;
        }
    }

    /**
     * Load products from JSON file
     */
    const loadProducts = async () => {
        try {
            const response = await fetch('assets/data/products.json');
            
            if (!response.ok) {
                throw new Error('Failed to load products data');
            }
            
            const data = await response.json();
            
            // Convert JSON data to Product objects
            products = data.products.map(item => new Product(
                item.id,
                item.name,
                item.price,
                item.category,
                item.images,
                item.description,
                item.sizes,
                item.colors,
                item.isNew,
                item.isFeatured
            ));
            
            // Store categories data if needed
            if (data.categories) {
                // You could store categories here if needed for filtering
                // categories = data.categories;
            }
            
            // Store featured collections data if needed
            if (data.featured_collections) {
                // You could store featured collections here if needed
                // featuredCollections = data.featured_collections;
            }
            
            return products;
        } catch (error) {
            console.error('Error loading products:', error);
            
            // Fallback to sample data in case the JSON file fails to load
            products = [
                new Product(
                    1, 
                    "Olive Stitched Maxi Dress", 
                    129.99, 
                    "dresses", 
                    ["assets/images/products/olive-maxi-dress-1.jpg", "assets/images/products/olive-maxi-dress-2.jpg"], 
                    "Hand-stitched olive maxi dress with unique embroidery patterns, perfect for special occasions.",
                    ["S", "M", "L", "XL"],
                    ["Olive Green", "Black"],
                    true,
                    true
                ),
                new Product(
                    2, 
                    "Minimalist Embroidered Blouse", 
                    79.99, 
                    "tops", 
                    ["assets/images/products/minimalist-blouse-1.jpg", "assets/images/products/minimalist-blouse-2.jpg"], 
                    "Elegant minimalist blouse with hand-stitched patterns that add subtle sophistication.",
                    ["S", "M", "L"],
                    ["White", "Beige", "Black"],
                    true,
                    false
                )
            ];
            
            return products;
        }
    };

    /**
     * Filter products based on current filter settings
     */
    const filterProducts = () => {
        return products.filter(product => {
            // Category filter
            if (currentFilters.category !== 'all' && product.category !== currentFilters.category) {
                return false;
            }
            
            // Price range filter
            if (product.price < currentFilters.priceRange.min || product.price > currentFilters.priceRange.max) {
                return false;
            }
            
            return true;
        });
    };

    /**
     * Sort products based on current sort setting
     */
    const sortProducts = (filteredProducts) => {
        switch (currentFilters.sortBy) {
            case 'price-low-high':
                return filteredProducts.sort((a, b) => a.price - b.price);
            case 'price-high-low':
                return filteredProducts.sort((a, b) => b.price - a.price);
            case 'newest':
                return filteredProducts.sort((a, b) => (b.isNew === a.isNew) ? 0 : b.isNew ? 1 : -1);
            case 'featured':
                return filteredProducts.sort((a, b) => (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1);
            default:
                return filteredProducts;
        }
    };

    /**
     * Render products to the product container
     */
    const renderProducts = () => {
        if (!elements.productContainer) return;
        
        const filteredProducts = filterProducts();
        const sortedProducts = sortProducts(filteredProducts);
        
        elements.productContainer.innerHTML = '';
        
        if (sortedProducts.length === 0) {
            elements.productContainer.innerHTML = '<div class="no-products">No products match your criteria</div>';
            return;
        }
        
        sortedProducts.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <div class="product-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                    ${product.isNew ? '<span class="badge new">New</span>' : ''}
                    ${product.isFeatured ? '<span class="badge featured">Featured</span>' : ''}
                    <button class="wishlist-btn" data-product-id="${product.id}">
                        <i class="fa-heart ${wishlist.some(item => item.id === product.id) ? 'fas' : 'far'}"></i>
                    </button>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <div class="color-options">
                        ${product.colors.map(color => `<span class="color-dot" style="background-color: ${color.toLowerCase()}"></span>`).join('')}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn view-details" data-product-id="${product.id}">View Details</button>
                    <button class="btn add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                </div>
            `;
            
            elements.productContainer.appendChild(productElement);
        });
        
        // Add event listeners to the product elements
        attachProductEventListeners();
    };

    /**
     * Attach event listeners to product elements
     */
    const attachProductEventListeners = () => {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    // For simplicity, we're adding directly to cart
                    // In a real implementation, you'd open a modal to select size, color, etc.
                    addToCart(product);
                }
            });
        });
        
        // View details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                viewProductDetails(productId);
            });
        });
        
        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                toggleWishlist(productId);
                
                // Toggle wishlist icon
                const icon = e.currentTarget.querySelector('i');
                icon.classList.toggle('far');
                icon.classList.toggle('fas');
            });
        });
    };

    /**
     * View product details (open modal or go to product page)
     */
    const viewProductDetails = (productId) => {
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        // In a real implementation, you'd either open a modal or navigate to a product page
        // For now, we'll just alert the product details
        alert(`${product.name}\nPrice: $${product.price.toFixed(2)}\n${product.description}`);
        
        // In a real implementation, you'd use:
        // window.location.href = `product.html?id=${productId}`;
    };

    /**
     * Add a product to the cart
     */
    const addToCart = (product, quantity = 1, size = null, color = null) => {
        // Check if product is already in cart
        const existingItem = cart.find(item => 
            item.product.id === product.id && 
            item.size === size && 
            item.color === color
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push(new CartItem(product, quantity, size, color));
        }
        
        // Update cart UI
        updateCartUI();
        
        // Save cart to localStorage
        saveCart();
        
        // Show confirmation message
        showMessage(`${product.name} added to cart!`, 'success');
    };

    /**
     * Remove an item from the cart
     */
    const removeFromCart = (index) => {
        cart.splice(index, 1);
        
        // Update cart UI
        updateCartUI();
        
        // Save cart to localStorage
        saveCart();
        
        // Show confirmation message
        showMessage('Item removed from cart', 'info');
    };

    /**
     * Update cart quantity
     */
    const updateCartQuantity = (index, newQuantity) => {
        if (newQuantity < 1) {
            // If quantity is less than 1, remove the item
            removeFromCart(index);
            return;
        }
        
        cart[index].quantity = newQuantity;
        
        // Update cart UI
        updateCartUI();
        
        // Save cart to localStorage
        saveCart();
    };

    /**
     * Update the cart UI elements
     */
    const updateCartUI = () => {
        // Update cart counter
        if (elements.cartCounter) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            elements.cartCounter.textContent = totalItems;
            elements.cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        }
        
        // Update cart items list
        if (elements.cartItems) {
            elements.cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                elements.cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            } else {
                cart.forEach((item, index) => {
                    const cartItemElement = document.createElement('div');
                    cartItemElement.className = 'cart-item';
                    cartItemElement.innerHTML = `
                        <div class="cart-item-image">
                            <img src="${item.product.images[0]}" alt="${item.product.name}">
                        </div>
                        <div class="cart-item-details">
                            <h4>${item.product.name}</h4>
                            <p>$${item.product.price.toFixed(2)}</p>
                            ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                            ${item.color ? `<p>Color: ${item.color}</p>` : ''}
                        </div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn minus" data-index="${index}">-</button>
                            <input type="number" value="${item.quantity}" min="1" data-index="${index}">
                            <button class="qty-btn plus" data-index="${index}">+</button>
                        </div>
                        <div class="cart-item-total">
                            $${item.total.toFixed(2)}
                        </div>
                        <button class="remove-item" data-index="${index}">&times;</button>
                    `;
                    
                    elements.cartItems.appendChild(cartItemElement);
                });
                
                // Add event listeners to cart item elements
                attachCartEventListeners();
            }
        }
        
        // Update cart total
        if (elements.cartTotal) {
            const total = cart.reduce((sum, item) => sum + item.total, 0);
            elements.cartTotal.textContent = `$${total.toFixed(2)}`;
        }
    };

    /**
     * Attach event listeners to cart item elements
     */
    const attachCartEventListeners = () => {
        // Remove item buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                removeFromCart(index);
            });
        });
        
        // Quantity buttons
        document.querySelectorAll('.qty-btn.minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                updateCartQuantity(index, cart[index].quantity - 1);
            });
        });
        
        document.querySelectorAll('.qty-btn.plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                updateCartQuantity(index, cart[index].quantity + 1);
            });
        });
        
        // Quantity input fields
        document.querySelectorAll('.cart-item-quantity input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const newQuantity = parseInt(e.target.value);
                updateCartQuantity(index, newQuantity);
            });
        });
    };

    /**
     * Toggle product in wishlist
     */
    const toggleWishlist = (productId) => {
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        const index = wishlist.findIndex(p => p.id === productId);
        
        if (index >= 0) {
            // Remove from wishlist
            wishlist.splice(index, 1);
            showMessage(`${product.name} removed from wishlist`, 'info');
        } else {
            // Add to wishlist
            wishlist.push(product);
            showMessage(`${product.name} added to wishlist`, 'success');
        }
        
        // Update wishlist counter
        if (elements.wishlistCounter) {
            elements.wishlistCounter.textContent = wishlist.length;
            elements.wishlistCounter.style.display = wishlist.length > 0 ? 'block' : 'none';
        }
        
        // Save wishlist to localStorage
        saveWishlist();
    };

    /**
     * Save cart to localStorage
     */
    const saveCart = () => {
        // Convert cart items to a simpler format for storage
        const cartForStorage = cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color
        }));
        
        localStorage.setItem('shaki-cart', JSON.stringify(cartForStorage));
    };

    /**
     * Load cart from localStorage
     */
    const loadCart = () => {
        const cartData = localStorage.getItem('shaki-cart');
        
        if (!cartData) return;
        
        try {
            const cartItems = JSON.parse(cartData);
            
            cart = cartItems.map(item => {
                const product = products.find(p => p.id === item.productId);
                return product ? new CartItem(product, item.quantity, item.size, item.color) : null;
            }).filter(item => item !== null);
            
            // Update cart UI
            updateCartUI();
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    /**
     * Save wishlist to localStorage
     */
    const saveWishlist = () => {
        const wishlistIds = wishlist.map(product => product.id);
        localStorage.setItem('shaki-wishlist', JSON.stringify(wishlistIds));
    };

    /**
     * Load wishlist from localStorage
     */
    const loadWishlist = () => {
        const wishlistData = localStorage.getItem('shaki-wishlist');
        
        if (!wishlistData) return;
        
        try {
            const wishlistIds = JSON.parse(wishlistData);
            
            wishlist = wishlistIds.map(id => products.find(p => p.id === id)).filter(product => product !== null);
            
            // Update wishlist counter
            if (elements.wishlistCounter) {
                elements.wishlistCounter.textContent = wishlist.length;
                elements.wishlistCounter.style.display = wishlist.length > 0 ? 'block' : 'none';
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    };

    /**
     * Show a message to the user
     */
    const showMessage = (message, type = 'info') => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        document.body.appendChild(messageElement);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 500);
        }, 3000);
    };

    /**
     * Initialize the shop
     */
    const init = async () => {
        // Load products
        await loadProducts();
        
        // Get DOM elements
        elements = {
            productContainer: document.querySelector('.products-grid'),
            cartCounter: document.querySelector('.cart-counter'),
            cartItems: document.querySelector('.cart-items'),
            cartTotal: document.querySelector('.cart-total'),
            filterForm: document.querySelector('.filter-form'),
            sortSelector: document.querySelector('#sort-by'),
            wishlistCounter: document.querySelector('.wishlist-counter')
        };
        
        // Load cart and wishlist from localStorage
        loadWishlist();
        loadCart();
        
        // Set up event listeners
        setupEventListeners();
        
        // Render products
        renderProducts();
    };

    /**
     * Set up event listeners
     */
    const setupEventListeners = () => {
        // Category filter
        if (elements.filterForm) {
            elements.filterForm.addEventListener('change', (e) => {
                if (e.target.name === 'category') {
                    currentFilters.category = e.target.value;
                    renderProducts();
                }
                
                if (e.target.name === 'price-range') {
                    const priceRanges = {
                        'all': { min: 0, max: Infinity },
                        'under-50': { min: 0, max: 50 },
                        '50-100': { min: 50, max: 100 },
                        '100-200': { min: 100, max: 200 },
                        'over-200': { min: 200, max: Infinity }
                    };
                    
                    currentFilters.priceRange = priceRanges[e.target.value] || { min: 0, max: Infinity };
                    renderProducts();
                }
            });
        }
        
        // Sort selector
        if (elements.sortSelector) {
            elements.sortSelector.addEventListener('change', (e) => {
                currentFilters.sortBy = e.target.value;
                renderProducts();
            });
        }
        
        // Cart toggle
        const cartToggle = document.querySelector('.cart-toggle');
        const cartSidebar = document.querySelector('.cart-sidebar');
        
        if (cartToggle && cartSidebar) {
            cartToggle.addEventListener('click', () => {
                cartSidebar.classList.toggle('open');
            });
            
            // Close cart when clicking outside
            document.addEventListener('click', (e) => {
                if (!cartSidebar.contains(e.target) && !cartToggle.contains(e.target) && cartSidebar.classList.contains('open')) {
                    cartSidebar.classList.remove('open');
                }
            });
        }
        
        // Checkout button
        const checkoutButton = document.querySelector('.checkout-btn');
        
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                if (cart.length === 0) {
                    showMessage('Your cart is empty', 'error');
                    return;
                }
                
                // In a real implementation, you'd redirect to checkout page
                // For now, we'll just alert the checkout details
                const total = cart.reduce((sum, item) => sum + item.total, 0);
                alert(`Checkout\nTotal: $${total.toFixed(2)}\nItems: ${cart.length}`);
                
                // window.location.href = 'checkout.html';
            });
        }
    };

    // Return public methods
    return {
        init,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        filterProducts,
        sortProducts
    };
})();

// Initialize the shop when the DOM is loaded
document.addEventListener('DOMContentLoaded', ShakiShop.init);