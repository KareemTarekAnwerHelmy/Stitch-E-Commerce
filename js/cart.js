document.addEventListener('DOMContentLoaded', function () {
    const cartTableBody = document.querySelector('.cart-table tbody');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const cartCounter = document.getElementById('cart-counter');
    const shippingCost = 5.0;
    const cartKey = 'shoppingCart';

const checkoutBtn = document.getElementById('checkout-btn');
const receiptModal = document.getElementById('receipt-modal');
const closeReceipt = document.querySelector('.close-receipt');

checkoutBtn.addEventListener('click', generateReceipt);
closeReceipt.addEventListener('click', () => {
    receiptModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === receiptModal) {
        receiptModal.style.display = 'none';
    }
});

function generateReceipt() {
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const receiptItems = document.getElementById('receipt-items');
    const receiptDate = document.getElementById('receipt-date');
    const receiptSubtotal = document.getElementById('receipt-subtotal');
    const receiptShipping = document.getElementById('receipt-shipping');
    const receiptTotal = document.getElementById('receipt-total');

    receiptItems.innerHTML = '';

    const currentDate = new Date().toLocaleString();
    receiptDate.textContent = currentDate;

    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price.replace('$', '')) * item.quantity;
        subtotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'receipt-item';
        itemElement.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small>Quantity: ${item.quantity} × ${item.price}</small>
            </div>
            <div>$${itemTotal.toFixed(2)}</div>
        `;
        receiptItems.appendChild(itemElement);
    });

    receiptSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    receiptShipping.textContent = `$${shippingCost.toFixed(2)}`;
    receiptTotal.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;

    receiptModal.style.display = 'block';
}

    loadCart();
    cartCounter.textContent = getCartCount();

    function loadCart() {
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        let subtotal = 0;

        cartTableBody.innerHTML = '';

        cart.forEach((item, index) => {
            const itemTotal = parseFloat(item.price.replace('$', '')) * item.quantity;
            subtotal += itemTotal;

            const row = document.createElement('tr');
            row.classList.add('cart-item');
            row.innerHTML = `
                <td>
                    <img src="${item.image}" alt="${item.name}">
                    <span>${item.name}</span>
                </td>
                <td class="product-price">${item.price}</td>
                <td>
                    <input type="number" class="product-quantity" value="${item.quantity}" min="1" data-index="${index}">
                </td>
                <td class="product-total">$${itemTotal.toFixed(2)}</td>
                <td>
                    <button class="remove-item" data-index="${index}">Remove</button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        totalElement.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
        attachEventListeners();
    }

    function attachEventListeners() {
        document.querySelectorAll('.product-quantity').forEach(input => {
            input.addEventListener('input', updateQuantity);
        });
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeItem);
        });
    }

    function updateQuantity(event) {
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const index = event.target.dataset.index;
        const newQuantity = parseInt(event.target.value);

        if (newQuantity > 0) {
            cart[index].quantity = newQuantity;
            localStorage.setItem(cartKey, JSON.stringify(cart));
            loadCart();
        }
    }

    function removeItem(event) {
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const index = event.target.dataset.index;

        cart.splice(index, 1);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
        cartCounter.textContent = getCartCount();
    }

    function getCartCount() {
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        return cart.reduce((count, product) => count + product.quantity, 0);
    }
});
