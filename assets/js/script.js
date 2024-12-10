'use strict';

class ShopManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.initializeEventListeners();
        this.updateCartCount();
        this.initializeAuth();
    }

    initializeEventListeners() {
        // Handle "Shop Now" and "Add to Cart" buttons
        document.querySelectorAll('.banner-btn, .add-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const container = e.target.closest('.slider-item, .showcase');
                const product = container.classList.contains('slider-item') ? 
                    this.getProductFromBanner(container) : 
                    this.getProductFromShowcase(container);
                
                if (product) {
                    this.addToCart(product);
                }
            });
        });

        // Handle cart icon click
        const cartBtn = document.querySelector('[name="bag-handle-outline"]')?.closest('.action-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
        }

        // Initialize cart display if on cart page
        if (window.location.pathname.includes('cart.html')) {
            this.displayCartItems();
        }
    }

    getProductFromBanner(banner) {
        if (!banner) return null;
        return {
            name: banner.querySelector('.banner-subtitle')?.textContent || 'Product',
            price: this.extractPrice(banner.querySelector('.banner-text b')?.textContent),
            image: banner.querySelector('.banner-img')?.src,
            description: banner.querySelector('.banner-text')?.textContent,
            quantity: 1
        };
    }

    getProductFromShowcase(showcase) {
        if (!showcase) return null;
        return {
            name: showcase.querySelector('.showcase-title')?.textContent,
            price: this.extractPrice(showcase.querySelector('.price')?.textContent),
            originalPrice: this.extractPrice(showcase.querySelector('del')?.textContent),
            image: showcase.querySelector('.showcase-img')?.src,
            description: showcase.querySelector('.showcase-desc')?.textContent,
            rating: showcase.querySelector('.showcase-rating')?.innerHTML,
            quantity: 1
        };
    }

    extractPrice(text) {
        if (!text) return 0;
        const priceMatch = text.match(/\$?(\d+\.?\d*)/);
        return priceMatch ? parseFloat(priceMatch[1]) : 0;
    }

    addToCart(product) {
        if (!product || !product.price) return;

        const existingItem = this.cart.find(item => item.name === product.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }

    updateCartCount() {
        const cartCount = document.querySelector('.action-btn .count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    displayCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <ion-icon name="cart-outline"></ion-icon>
                    <p>Your cart is empty</p>
                    <a href="index.html" class="btn-auth">Continue Shopping</a>
                </div>`;
            this.updateCartSummary(0);
            return;
        }

        let cartHTML = '';
        let total = 0;

        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            cartHTML += `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-header">
                            <h3 class="cart-item-title">${item.name}</h3>
                            <div class="showcase-rating">
                                ${item.rating || this.generateRatingStars(4)}
                            </div>
                        </div>
                        <p class="cart-item-desc">${item.description || ''}</p>
                        <div class="cart-item-price-box">
                            <div class="price-details">
                                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                                ${item.originalPrice ? `<del>$${item.originalPrice.toFixed(2)}</del>` : ''}
                            </div>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="shopManager.updateQuantity(${index}, -1)">
                                    <ion-icon name="remove-outline"></ion-icon>
                                </button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" onclick="shopManager.updateQuantity(${index}, 1)">
                                    <ion-icon name="add-outline"></ion-icon>
                                </button>
                            </div>
                        </div>
                        <div class="cart-item-footer">
                            <div class="item-total">
                                Item Total: <span>$${itemTotal.toFixed(2)}</span>
                            </div>
                            <button class="remove-btn" onclick="shopManager.removeFromCart(${index})">
                                <ion-icon name="trash-outline"></ion-icon>
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = cartHTML;
        this.updateCartSummary(total);
    }

    updateQuantity(index, change) {
        if (this.cart[index]) {
            this.cart[index].quantity = Math.max(1, this.cart[index].quantity + change);
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartCount();
            this.displayCartItems();
        }
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.displayCartItems();
    }

    updateCartSummary(total) {
        const subtotalElement = document.getElementById('cart-subtotal');
        const totalElement = document.getElementById('cart-total-amount');
        
        if (subtotalElement) subtotalElement.textContent = `$${total.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }

    generateRatingStars(rating) {
        return Array(5).fill('').map((_, index) => 
            `<ion-icon name="${index < rating ? 'star' : 'star-outline'}"></ion-icon>`
        ).join('');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    initializeAuth() {
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        // Update auth UI on page load
        this.updateAuthUI();

        // Handle login/signup button clicks
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (!this.isLoggedIn()) {
                    window.location.href = 'login.html';
                }
            });
        }

        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                if (this.isLoggedIn()) {
                    this.handleLogout();
                } else {
                    window.location.href = 'signup.html';
                }
            });
        }

        // Handle login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Handle signup form submission
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    isLoggedIn() {
        return !!localStorage.getItem('currentUser');
    }

    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showNotification('Login successful!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    handleSignup() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.email === email)) {
            this.showNotification('Email already registered', 'error');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.showNotification('Registration successful!', 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
    }

    handleLogout() {
        localStorage.removeItem('currentUser');
        this.showNotification('Logged out successfully', 'info');
        setTimeout(() => window.location.reload(), 1500);
    }

    updateAuthUI() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        if (currentUser && loginBtn && signupBtn) {
            loginBtn.innerHTML = `
                <ion-icon name="person"></ion-icon>
                <span class="btn-text">${currentUser.name}</span>
            `;
            signupBtn.innerHTML = `
                <ion-icon name="log-out-outline"></ion-icon>
                <span class="btn-text">Logout</span>
            `;
        }
    }
}

// Initialize the shop manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shopManager = new ShopManager();
});