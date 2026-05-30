let cart = [];
let menuItems = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    fetchMenu();

    document.getElementById('seed-btn').addEventListener('click', seedMenu);
    document.getElementById('checkout-btn').addEventListener('click', checkout);
});

// User Service
async function fetchUserProfile() {
    try {
        const res = await fetch('/api/users/profile');
        const user = await res.json();
        document.getElementById('user-profile').innerText = `Welcome, ${user.name}`;
    } catch (e) {
        document.getElementById('user-profile').innerText = `Welcome, Guest`;
    }
}

// Menu Service
async function fetchMenu() {
    try {
        const res = await fetch('/api/menu');
        menuItems = await res.json();
        renderMenu();
    } catch (e) {
        console.error('Error fetching menu:', e);
    }
}

async function seedMenu() {
    try {
        await fetch('/api/menu/seed', { method: 'POST' });
        alert('Database Seeded!');
        fetchMenu();
    } catch (e) {
        alert('Failed to seed DB');
    }
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    if (menuItems.length === 0) {
        container.innerHTML = `<p class="text-center text-muted">No menu items found. Click 'Seed Database'!</p>`;
        return;
    }

    container.innerHTML = menuItems.map(item => `
        <div class="col-md-4">
            <div class="card h-100 shadow-sm border-0 food-card">
                <img src="${item.imageUrl}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold">${item.name}</h5>
                    <p class="card-text text-muted flex-grow-1">${item.description}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <span class="fs-5 fw-bold text-danger">₹${item.price}</span>
                        <button class="btn btn-outline-danger" onclick="addToCart('${item._id}')">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Cart Logic
function addToCart(id) {
    const item = menuItems.find(m => m._id === id);
    const existing = cart.find(c => c._id === id);
    if (existing) existing.qty += 1;
    else cart.push({ ...item, qty: 1 });
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(c => c._id !== id);
    updateCartUI();
}

function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    document.getElementById('cart-count').innerText = totalQty;
    document.getElementById('cart-total').innerText = totalAmount;
    document.getElementById('modal-total').innerText = totalAmount;

    const cartItemsDiv = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
        return;
    }

    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${item.qty}x ${item.name}</span>
            <div>
                <span class="fw-bold me-2">₹${item.price * item.qty}</span>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item._id}')">X</button>
            </div>
        </div>
    `).join('');
}

// Order Service
async function checkout() {
    if (cart.length === 0) return alert('Cart is empty!');
    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    
    if (!name || !address) return alert('Please enter name and address');

    const orderData = {
        customerName: name,
        customerAddress: address,
        items: cart,
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const data = await res.json();
        
        alert('Order placed successfully! ID: ' + data.orderId);
        cart = [];
        updateCartUI();
        document.querySelector('.btn-close').click(); // close modal
    } catch (e) {
        alert('Checkout failed!');
    }
}
