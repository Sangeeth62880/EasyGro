document.addEventListener('DOMContentLoaded', () => {
    const inventoryContainer = document.getElementById('inventoryContainer');
    const products = [
        { id: 1, name: 'Apples', quantity: 15, image: 'images/apples.jpg' },
        { id: 2, name: 'Bread', quantity: 8, image: 'images/bread.jpg' },
        { id: 3, name: 'Eggs', quantity: 0, image: 'images/egg.jpg' },
        { id: 4, name: 'Milk', quantity: 4, image: 'images/milk.jpg' },
        { id: 5, name: 'Spinach', quantity: 12, image: 'images/spinach.jpg' },
        { id: 6, name: 'Greek Yogurt', quantity: 0, image: 'images/yogurt.jpg' },
        { id: 7, name: 'Carrot', quantity: 15, image: 'images/carrot.jpg' },
        { id: 8, name: 'Cheese', quantity: 8, image: 'images/cheese.jpg' },
        { id: 9, name: 'Banana', quantity: 0, image: 'images/banana.jpg' },
        { id: 10, name: 'Strawberry', quantity: 0, image: 'images/strawberry.jpg' },
        { id: 11, name: 'Avacado', quantity: 0, image: 'images/avacado.jpg' },
        { id: 12, name: 'Orange', quantity: 0, image: 'images/orange.jpg' },
        { id: 13, name: 'Choclate', quantity: 0, image: 'images/choclate.jpg' },
       
    
    ];

    const renderProducts = () => {
        inventoryContainer.innerHTML = products.map(product => `
            <div class="product-card">
                ${product.quantity <= 5 && product.quantity > 0 ? 
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

    // Initial render
    renderProducts();
});