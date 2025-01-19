const productApiUrl = 'http://localhost:3000/products';
const orderApiUrl = 'http://localhost:3000/orders';

async function fetchProducts() {
    try {
        const response = await fetch(productApiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        showMessage('Failed to fetch products: ' + error.message, 'error');
    }
}

function displayProducts(products) {
    const productList = document.getElementById('product-list');
    if (products && products.length > 0) {
        productList.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p><strong>Price:</strong> $${product.price}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <button class="edit" onclick="startEdit(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    Edit
                </button>
                <button class="delete" onclick="deleteProduct(${product.id})">
                    Delete
                </button>
            </div>
        `).join('');
    } else {
        productList.innerHTML = '<p>No products available</p>';
    }
}

document.getElementById('add-product-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('product-name').value.trim());
    formData.append('price', document.getElementById('product-price').value.trim());
    formData.append('category', document.getElementById('product-category').value.trim());
    formData.append('status', 'rejected');
    const imageFile = document.getElementById('product-image').files[0];
    
    if (!formData.get('name') || !formData.get('price') || !formData.get('category') || !imageFile) {
        showMessage('Please fill out all fields and select an image', 'error');
        return;
    }

    try {
        
        const imageUrl = URL.createObjectURL(imageFile);
        
        const product = {
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            status: 'rejected',  
            image: imageUrl
        };

        const response = await fetch(productApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });

        if (!response.ok) throw new Error('Failed to add product');
        
        showMessage('Product added successfully!', 'success');
        event.target.reset();
        fetchProducts();
    } catch (error) {
        showMessage('Failed to add product: ' + error.message, 'error');
    }
});

function startEdit(product) {
    document.getElementById('edit-product-form').classList.add('active');
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-category').value = product.category;
}

document.getElementById('edit-product-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const productId = document.getElementById('edit-product-id').value;
    const imageFile = document.getElementById('edit-product-image').files[0];
    
    try {
        const product = {
            name: document.getElementById('edit-product-name').value.trim(),
            price: parseFloat(document.getElementById('edit-product-price').value),
            category: document.getElementById('edit-product-category').value.trim()
        };

        if (imageFile) {

            product.image = URL.createObjectURL(imageFile);
        }

        const response = await fetch(`${productApiUrl}/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });

        if (!response.ok) throw new Error('Failed to update product');
        
        showMessage('Product updated successfully!', 'success');
        cancelEdit();
        fetchProducts();
    } catch (error) {
        showMessage('Failed to update product: ' + error.message, 'error');
    }
});

function cancelEdit() {
    document.getElementById('edit-product-form').classList.remove('active');
    document.getElementById('edit-product-form').reset();
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${productApiUrl}/${productId}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        showMessage('Product deleted successfully!', 'success');
        fetchProducts();
    } catch (error) {
        showMessage('Failed to delete product: ' + error.message, 'error');
    }
}

async function fetchOrders() {
    try {
        const response = await fetch(orderApiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        showMessage('Failed to fetch orders: ' + error.message, 'error');
    }
}

function displayOrders(orders) {
    const orderList = document.getElementById('order-list');
    if (orders && orders.length > 0) {
        orderList.innerHTML = orders.map(order => `
            <div class="order-card">
                <h3>Order #${order.id}</h3>
                <p><strong>Customer:</strong> ${order.customer}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <div class="order-actions">
                    ${order.status !== 'shipped' && order.status !== 'delivered' ?
                        `<button onclick="updateOrderStatus(${order.id}, 'shipped')">
                            Mark as Shipped
                        </button>` : ''
                    }
                    ${order.status !== 'delivered' ?
                        `<button onclick="updateOrderStatus(${order.id}, 'delivered')">
                            Mark as Delivered
                        </button>` : ''
                    }
                </div>
            </div>
        `).join('');
    } else {
        orderList.innerHTML = '<p>No orders available</p>';
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${orderApiUrl}/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        
        if (!response.ok) throw new Error('Failed to update order status');
        
        showMessage(`Order ${orderId} marked as ${status}`, 'success');
        fetchOrders();
    } catch (error) {
        showMessage('Failed to update order status: ' + error.message, 'error');
    }
}

function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 3000);
}

fetchProducts();
fetchOrders();