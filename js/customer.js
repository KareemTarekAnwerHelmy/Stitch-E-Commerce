class Customer {
    constructor() {
        this.isLoggedIn = false;
        this.profile = null;
        this.orderHistory = [];
        this.cart = [];
        this.purchasedProducts = new Set();
    }

    login(email, password) {
        if (email && password) {
            this.isLoggedIn = true;
            this.profile = {
                email: email,
                username: email.split('@')[0],
                joinDate: new Date().toISOString()
            };
            return true;
        }
        return false;
    }

    updateProfile(userData) {
        if (!this.isLoggedIn) return false;
        this.profile = { ...this.profile, ...userData };
        return true;
    }

    addToCart(product) {
        if (!product) return false;
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.updateCartDisplay();
        return true;
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
    }

    checkout() {
        if (!this.isLoggedIn) {
            alert('Please login to checkout');
            return false;
        }
        if (this.cart.length === 0) {
            alert('Cart is empty');
            return false;
        }
        
        const order = {
            id: `ORD-${Date.now()}`,
            items: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            status: 'Processing',
            date: new Date().toISOString()
        };
        
        this.orderHistory.push(order);
        this.cart.forEach(item => this.purchasedProducts.add(item.id));
        this.cart = [];
        this.updateCartDisplay();
        return order;
    }

    submitReview(productId, rating, text) {
        if (!this.isLoggedIn) {
            alert('Please login to submit a review');
            return false;
        }
        
        if (!this.purchasedProducts.has(productId)) {
            alert('You can only review products you have purchased');
            return false;
        }

        const review = {
            productId,
            rating,
            text,
            date: new Date().toISOString(),
            customerName: this.profile.username
        };

        return review;
    }

    updateCartDisplay() {
        const cartCounter = document.getElementById('cart-counter');
        const cartItems = document.getElementById('cart-items');
        
        if (cartCounter) {
            cartCounter.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        if (cartItems) {
            cartItems.innerHTML = '';
            this.cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <p>${item.name} - $${item.price} x ${item.quantity}</p>
                    <button onclick="customer.removeFromCart(${item.id})">Remove</button>
                `;
                cartItems.appendChild(itemDiv);
            });
        }
    }

    viewOrderHistory() {
        return this.orderHistory;
    }
}

const customer = new Customer();

document.addEventListener('DOMContentLoaded', () => {

    const accountForm = document.getElementById('account-form');
    if (accountForm) {
        accountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(accountForm);
            const userData = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            if (!customer.isLoggedIn) {
                customer.login(userData.email, userData.password);
            }
            customer.updateProfile(userData);
            alert('Profile updated successfully!');
        });
    }

    const viewOrdersButton = document.getElementById('view-orders');
    if (viewOrdersButton) {
        viewOrdersButton.addEventListener('click', () => {
            const orders = customer.viewOrderHistory();
            alert(`You have ${orders.length} orders.\n${orders.map(order => 
                `Order ${order.id}: $${order.total} - ${order.status}`
            ).join('\n')}`);
        });
    }

    const submitReviewButton = document.getElementById('submit-review');
    if (submitReviewButton) {
        submitReviewButton.addEventListener('click', () => {
            const reviewText = document.getElementById('review-text').value;
            const rating = parseInt(document.getElementById('rating').value);
            const selectedProduct = products[0]; // For demo - would normally get from UI

            const review = customer.submitReview(selectedProduct.id, rating, reviewText);
            if (review) {
                alert('Review submitted successfully!');
            }
        });
    }
});

const searchHandler = () => {
    const searchInput = document.getElementById('search');
    const query = searchInput.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query)
    );
    displayProducts(filteredProducts);
};

const displayProducts = (productsToShow) => {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '';
    productsToShow.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <button onclick="customer.addToCart(${JSON.stringify(product)})">Add to Cart</button>
            ${customer.isLoggedIn && customer.purchasedProducts.has(product.id) ? 
                `<button onclick="showReviewForm(${product.id})">Write Review</button>` : ''}
        `;
        productList.appendChild(productDiv);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    
    const searchButton = document.getElementById('search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', searchHandler);
    }
});