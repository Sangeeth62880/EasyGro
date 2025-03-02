document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const orderModal = document.getElementById('orderModal');
    const confirmModal = document.getElementById('confirmModal');
    const orderForm = document.getElementById('orderForm');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const addOrderBtn = document.querySelector('.add-order-btn');
    const closeBtns = document.getElementsByClassName('close-btn');
    const productsList = document.getElementById('productsList');
    const addProductBtn = document.getElementById('addProductBtn');
    let currentOrderId = null;

    // Set current username
    document.getElementById('currentUserName').textContent = 'Sangeeth62880';

    // Close modals when clicking close buttons
    Array.from(closeBtns).forEach(btn => {
        btn.addEventListener('click', () => {
            orderModal.style.display = 'none';
            confirmModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === orderModal || e.target === confirmModal) {
            orderModal.style.display = 'none';
            confirmModal.style.display = 'none';
        }
    });

    // Load initial data
    loadOrders();
    updateOrderStats();
    loadProducts();

    // Search functionality
    searchInput.addEventListener('input', debounce(() => {
        filterOrders();
    }, 300));

    // Filter change handlers
    statusFilter.addEventListener('change', filterOrders);
    dateFilter.addEventListener('change', filterOrders);

    // Add product button handler
    addProductBtn.addEventListener('click', () => {
        addProductField();
    });

    // Form submission handler
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const orderData = {
            customerName: document.getElementById('customerName').value,
            products: Array.from(document.querySelectorAll('.product-item')).map(item => ({
                productId: item.querySelector('.product-select').value,
                quantity: parseInt(item.querySelector('.product-quantity').value)
            })),
            status: document.getElementById('status').value
        };

        try {
            if (currentOrderId) {
                await updateOrder(currentOrderId, orderData);
            } else {
                await createOrder(orderData);
            }
            orderModal.style.display = 'none';
            loadOrders();
            updateOrderStats();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // ... rest of your existing functions ...

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Make functions globally available
    window.editOrder = (orderId) => openModal(orderId);
    window.updateOrderStatus = updateOrderStatus;
});