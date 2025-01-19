document.addEventListener('DOMContentLoaded', function () {
    const productApiUrl = 'http://localhost:3000/products';
    const searchInput = document.getElementById('search-bar');
    const cartCounter = document.getElementById('cart-counter');
    const productsSection = document.getElementById('products');
    const cartKey = 'shoppingCart';

    cartCounter.textContent = getCartCount();

    async function fetchAndDisplayProducts() {
        try {
            const response = await fetch(productApiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            productsSection.innerHTML = '<p>Failed to load products. Please try again later.</p>';
        }
    }

    function renderProducts(products) {
        productsSection.innerHTML = products.map(product => `
            <div class="product">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <a href="/html/cart.html" class="Add to cart" data-product="${product.id}">Add to cart</a>
            </div>
        `).join('');

        attachEventListeners();
    }

    searchInput.addEventListener('input', filterProducts);

    function filterProducts() {
        const query = searchInput.value.toLowerCase().trim();
        const productCards = document.querySelectorAll('.product');

        productCards.forEach(card => {
            const productName = card.querySelector('h3').innerText.toLowerCase();
            const matches = productName.includes(query);
            card.style.display = matches ? 'block' : 'none';
        });
    }

    function attachEventListeners() {
        const addToCartButtons = document.querySelectorAll('.Add.to.cart');
        const productCards = document.querySelectorAll('.product');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                const productCard = this.closest('.product');
                const product = {
                    name: productCard.querySelector('h3').innerText,
                    price: productCard.querySelector('p').innerText,
                    image: productCard.querySelector('img').src,
                    quantity: 1,
                };

                addToCart(product);
                cartCounter.textContent = getCartCount();
            });
        });

        productCards.forEach(card => {
            const viewButton = card.querySelector('.Add.to.cart');
            if (viewButton) {
                viewButton.addEventListener('click', event => {
                    event.preventDefault();
                    viewProductDetails(card);
                });
            }
        });
    }

    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existingProduct = cart.find(item => item.name === product.name);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
    }

    function getCartCount() {
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        return cart.reduce((count, product) => count + product.quantity, 0);
    }

    function viewProductDetails(product) {
        const productName = product.querySelector('h3').innerText;
        const productPrice = product.querySelector('p').innerText;
        const productImage = product.querySelector('img').src;

        alert(
            `Product Details:\nName: ${productName}\nPrice: ${productPrice}\nImage URL: ${productImage}`
        );
    }

    fetchAndDisplayProducts();
});