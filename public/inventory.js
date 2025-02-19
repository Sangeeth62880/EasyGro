document.addEventListener('DOMContentLoaded', async () => {
    const inventoryContainer = document.getElementById('inventoryContainer');
    const user_id = localStorage.getItem('user_id');
    // Get or initialize handled items from localStorage
    const handledLowStockItems = JSON.parse(localStorage.getItem('handledLowStockItems') || '[]');

    if (!user_id) {
        window.location.href = '/login.html';
        return;
    }

    const fetchInventory = async () => {
        try {
            const response = await fetch(`http://localhost:5001/inventory/${user_id}`);
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            inventoryContainer.innerHTML = '<p class="error">Failed to load inventory</p>';
        }
    };

    const handleLowStock = async (products) => {
        try {
            const cartResponse = await fetch(`http://localhost:5001/cart/${user_id}`);
            const cartItems = await cartResponse.json();

            const lowStockItems = products.filter(product => {
                const cartItem = cartItems.find(ci => { return ci.product_id === product.id; });
                const totalQuantity = product.quantity + (cartItem ? cartItem.quantity : 0);
                return product.quantity >= 0 &&
                    totalQuantity < 2 &&
                    !cartItem;
            });

            for (const item of lowStockItems) {
                const cartItem = cartItems.find(ci => ci.product_id === item.id);
                const totalQuantity = item.quantity + (cartItem ? cartItem.quantity : 0);
                const quantityNeeded = 5 - totalQuantity;

                const response = await fetch("http://localhost:5001/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: parseInt(user_id),
                        product_id: item.id,
                        quantity: quantityNeeded
                    })
                });

                if (response.ok) {
                    showNotification(`Added ${quantityNeeded} ${item.name}(s) to cart due to low stock`);
                }
            }
        } catch (error) {
            console.error('Error handling low stock items:', error);
        }
    };

    let notificationQueue = [];
    let isShowingNotification = false;

    const showNotification = async (message) => {
        notificationQueue.push(message);
        if (!isShowingNotification) {
            processNotificationQueue();
        }
    };

    const processNotificationQueue = async () => {
        if (notificationQueue.length === 0) {
            isShowingNotification = false;
            return;
        }

        isShowingNotification = true;
        const message = notificationQueue.shift();

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        await new Promise(resolve => setTimeout(resolve, 3000));
        notification.remove();

        // Process next notification
        processNotificationQueue();
    };

    const renderProducts = (products) => {
        inventoryContainer.innerHTML = products.map(product => `
            <div class="product-card">
                ${product.quantity > 0 && product.quantity <= 2 ?
                '<div class="low-stock">Low Stock</div>' : ''}
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-quantity">Quantity: ${product.quantity}</p>
                <div class="stock-status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
                <button class="reminder-btn" data-id="${product.id}">
                    ${product.quantity > 0 ? 'Set Restock Reminder' : 'Notify When Available'}
                </button>
            </div>
        `).join('');

        // Check for low stock items and handle them
        handleLowStock(products);
    };

    const handleReminderClick = (productId) => {
        const product = products.find(p => p.id === productId);
        const action = product.quantity > 0 ?
            `We'll remind you when ${product.name} needs restocking!` :
            `We'll notify you when ${product.name} is back in stock!`;

        alert(action);
        // Here you would typically make an API call to set the reminder
    };

    inventoryContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('reminder-btn')) {
            const productId = parseInt(e.target.dataset.id);
            handleReminderClick(productId);
        }
    });

    // Initial fetch
    await fetchInventory();
});