document.addEventListener("DOMContentLoaded", async () => {
    const cartItemsContainer = document.getElementById("cart-items");
    const totalItemsElement = document.getElementById("total-items");
    const subtotalElement = document.getElementById("subtotal");
    const taxElement = document.getElementById("tax");
    const totalPriceElement = document.getElementById("total-price");

    let user_id = localStorage.getItem("user_id");
    if (!user_id) {
        window.location.href = '/login.html';
        return;
    }

    async function updateQuantity(itemId, newQuantity) {
        try {
            if (newQuantity < 1) return;

            const response = await fetch(`http://localhost:5001/cart/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (response.ok) await fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    }

    async function removeFromCart(itemId) {
        if (!confirm('Are you sure you want to remove this item?')) return;

        try {
            const response = await fetch(`http://localhost:5001/cart/${itemId}`, {
                method: 'DELETE'
            });

            if (response.ok) await fetchCart();
        } catch (error) {
            console.error("Error removing item:", error);
        }
    }

    async function fetchCart() {
        try {
            const response = await fetch(`http://localhost:5001/cart/${user_id}`);
            const cartItems = await response.json();

            cartItemsContainer.innerHTML = "";
            let totalItems = 0;
            let subtotal = 0;

            cartItems.forEach(item => {
                totalItems += item.quantity;
                const itemPrice = parseFloat(item.price);
                subtotal += itemPrice * item.quantity;

                const cartItemElement = document.createElement("div");
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>$${itemPrice.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="removeFromCart(${item.id})">Remove</button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });

            const tax = subtotal * 0.1;
            const total = subtotal + tax;

            totalItemsElement.textContent = totalItems;
            subtotalElement.textContent = subtotal.toFixed(2);
            taxElement.textContent = tax.toFixed(2);
            totalPriceElement.textContent = total.toFixed(2);

            if (cartItems.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="cart-empty">
                        <h3>Your cart is empty</h3>
                        <a href="/product.html" class="add-to-cart-btn">Continue Shopping</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            cartItemsContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading cart items. Please try again later.</p>
                </div>
            `;
        }
    }

    // Make functions available globally
    window.updateQuantity = updateQuantity;
    window.removeFromCart = removeFromCart;

    // Initial cart load
    await fetchCart();

    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`http://localhost:5001/checkout/${user_id}`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Checkout failed');

            const result = await response.json();
            alert('Purchase successful!');
            window.location.href = '/product.html';
        } catch (error) {
            console.error("Checkout error:", error);
            alert('Failed to complete purchase. Please try again.');
        }
    });
});
