document.addEventListener('DOMContentLoaded', () => {
    // Initialize sidebar functionality
    initializeSidebar();
    
    // Initialize dropdowns
    initializeDropdowns();
    
    // Initialize charts
    initializeCharts();
    
    // Load table data
    loadLowStockItems();
    loadRecentOrders();
    
    // Initialize search functionality
    initializeSearch();
});

// Sidebar functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarToggle = document.getElementById('sidebar-toggle-btn');
    const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');

    // Desktop sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // Mobile sidebar toggle
    mobileSidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && 
            !sidebar.contains(e.target) && 
            !mobileSidebarToggle.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    });
}

// Initialize dropdowns
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu.show')
            .forEach(menu => menu.classList.remove('show'));
    });
}

// Initialize charts
function initializeCharts() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    let currentChart = null;

    // Chart data
    const chartData = {
        daily: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [4000, 3000, 2000, 2780, 1890, 2390, 3490]
        },
        weekly: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [24000, 18000, 22000, 27000]
        },
        monthly: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [65000, 59000, 80000, 81000, 56000, 55000, 40000, 70000, 90000, 81000, 86000, 95000]
        }
    };

    // Create chart function
    function createChart(period) {
        if (currentChart) {
            currentChart.destroy();
        }

        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData[period].labels,
                datasets: [{
                    label: 'Sales ($)',
                    data: chartData[period].data,
                    backgroundColor: '#228B22',
                    borderColor: '#228B22',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '$' + value.toLocaleString()
                        }
                    }
                }
            }
        });
    }

    // Initialize with daily data
    createChart('daily');

    // Chart period tabs
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.chart-tab.active').classList.remove('active');
            tab.classList.add('active');
            createChart(tab.dataset.period);
        });
    });
}

// Load low stock items
function loadLowStockItems() {
    const lowStockItems = [
        {
            id: 'PRD-001',
            name: 'Organic Apples',
            category: 'Fruits',
            stock: 5,
            threshold: 10,
            supplier: 'FreshFarms Inc.'
        },
        {
            id: 'PRD-023',
            name: 'Whole Grain Bread',
            category: 'Bakery',
            stock: 3,
            threshold: 15,
            supplier: 'Healthy Bakers Co.'
        },
        {
            id: 'PRD-045',
            name: 'Free Range Eggs',
            category: 'Dairy',
            stock: 8,
            threshold: 20,
            supplier: 'Country Farms'
        },
        {
            id: 'PRD-067',
            name: 'Organic Milk',
            category: 'Dairy',
            stock: 4,
            threshold: 12,
            supplier: 'Green Valley Dairy'
        },
        {
            id: 'PRD-089',
            name: 'Fresh Spinach',
            category: 'Vegetables',
            stock: 2,
            threshold: 8,
            supplier: 'FreshFarms Inc.'
        }
    ];

    const tbody = document.getElementById('lowStockTable');
    tbody.innerHTML = lowStockItems.map(item => `
        <tr>
            <td class="font-medium">${item.name}</td>
            <td>${item.category}</td>
            <td>
                <div class="status-badge status-pending">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${item.stock} / ${item.threshold}
                </div>
            </td>
            <td class="text-right">
                <button class="btn btn-outline btn-sm" onclick="restockItem('${item.id}')">
                    Restock
                </button>
            </td>
        </tr>
    `).join('');
}

// Load recent orders
function loadRecentOrders() {
    const recentOrders = [
        {
            id: 'ORD-1234',
            customer: 'John Smith',
            status: 'Delivered',
            date: '2023-04-23',
            total: 129.99,
            items: 3
        },
        {
            id: 'ORD-1235',
            customer: 'Sarah Johnson',
            status: 'Processing',
            date: '2023-04-23',
            total: 59.99,
            items: 1
        },
        {
            id: 'ORD-1236',
            customer: 'Michael Brown',
            status: 'Shipped',
            date: '2023-04-22',
            total: 89.50,
            items: 2
        },
        {
            id: 'ORD-1237',
            customer: 'Emily Davis',
            status: 'Pending',
            date: '2023-04-22',
            total: 45.25,
            items: 1
        },
        {
            id: 'ORD-1238',
            customer: 'Robert Wilson',
            status: 'Delivered',
            date: '2023-04-21',
            total: 199.99,
            items: 4
        }
    ];

    const tbody = document.getElementById('recentOrdersTable');
    tbody.innerHTML = recentOrders.map(order => `
        <tr>
            <td class="font-medium">${order.id}</td>
            <td>${order.customer}</td>
            <td>${Utils.formatDate(order.date)}</td>
            <td>
                <div class="status-badge status-${order.status.toLowerCase()}">
                    <i class="fas fa-${getStatusIcon(order.status)}"></i>
                    ${order.status}
                </div>
            </td>
            <td class="text-right">${Utils.formatCurrency(order.total)}</td>
            <td class="text-right">
                <div class="dropdown">
                    <button class="btn btn-outline btn-sm dropdown-toggle">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="#" class="dropdown-item" onclick="viewOrder('${order.id}')">View details</a>
                        <a href="#" class="dropdown-item" onclick="updateOrderStatus('${order.id}')">Update status</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item text-danger" onclick="cancelOrder('${order.id}')">Cancel order</a>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    
    searchInput.addEventListener('input', Utils.debounce((e) => {
        const searchTerm = e.target.value;
        
        // Filter low stock items
        Utils.filterTable(
            document.querySelector('#lowStockTable').closest('table'),
            searchTerm
        );
        
        // Filter recent orders
        Utils.filterTable(
            document.querySelector('#recentOrdersTable').closest('table'),
            searchTerm
        );
    }), 300);
}

// Helper functions
function getStatusIcon(status) {
    switch (status) {
        case 'Delivered':
            return 'check-circle';
        case 'Processing':
            return 'sync';
        case 'Shipped':
            return 'truck';
        case 'Pending':
            return 'clock';
        default:
            return 'info-circle';
    }
}

// Action functions
function restockItem(itemId) {
    Utils.showModal({
        title: 'Restock Item',
        content: `
            <form id="restockForm">
                <div class="form-group">
                    <label>Quantity to restock:</label>
                    <input type="number" class="form-control" min="1" value="10">
                </div>
            </form>
        `,
        onConfirm: () => {
            Utils.showToast('Item restocked successfully', 'success');
            loadLowStockItems(); // Reload the table
        }
    });
}

function viewOrder(orderId) {
    Utils.showModal({
        title: 'Order Details',
        content: `<div class="order-details">Loading order ${orderId}...</div>`,
        confirmText: 'Close',
        cancelText: null
    });
}

function updateOrderStatus(orderId) {
    Utils.showModal({
        title: 'Update Order Status',
        content: `
            <form id="statusForm">
                <div class="form-group">
                    <label>New Status:</label>
                    <select class="form-control">
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                    </select>
                </div>
            </form>
        `,
        onConfirm: () => {
            Utils.showToast('Order status updated successfully', 'success');
            loadRecentOrders(); // Reload the table
        }
    });
}

function cancelOrder(orderId) {
    Utils.showModal({
        title: 'Cancel Order',
        content: `Are you sure you want to cancel order ${orderId}?`,
        confirmText: 'Yes, Cancel Order',
        onConfirm: () => {
            Utils.showToast('Order cancelled successfully', 'success');
            loadRecentOrders(); // Reload the table
        }
    });
}