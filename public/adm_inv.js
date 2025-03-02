// DOM Elements
const inventoryTableBody = document.getElementById('inventoryTableBody');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const searchInput = document.getElementById('searchInventory');
const categoryFilter = document.getElementById('categoryFilter');
const availabilityFilter = document.getElementById('availabilityFilter');
const closeModalBtn = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modalTitle');

// State
let products = [];
let currentProductId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', loadProducts);
addProductBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
productForm.addEventListener('submit', handleProductSubmit);
searchInput.addEventListener('input', filterProducts);
categoryFilter.addEventListener('change', filterProducts);
availabilityFilter.addEventListener('change', filterProducts);

// Functions
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

function renderProducts() {
    const filteredProducts = filterProductsList();
    inventoryTableBody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td><img src="${product.image_url || 'placeholder.jpg'}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <span class="status-badge ${product.stock > 0 ? 'status-in-stock' : 'status-out-of-stock'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterProductsList() {
    return products.filter(product => {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const availability = availabilityFilter.value;

        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        const matchesAvailability = !availability || 
            (availability === 'in-stock' && product.stock > 0) ||
            (availability === 'out-of-stock' && product.stock === 0);

        return matchesSearch && matchesCategory && matchesAvailability;
    });
}

function filterProducts() {
    renderProducts();
}

function openModal(productId = null) {
    currentProductId = productId;
    modalTitle.textContent = productId ? 'Edit Product' : 'Add New Product';
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
        }
    } else {
        productForm.reset();
    }
    
    productModal.style.display = 'block';
}

function closeModal() {
    productModal.style.display = 'none';
    productForm.reset();
    currentProductId = null;
}

async function handleProductSubmit(event) {
    event.preventDefault();

    const formData = new FormData(productForm);
    const productData = {
        name: formData.get('productName'),
        category: formData.get('productCategory'),
        price: parseFloat(formData.get('productPrice')),
        stock: parseInt(formData.get('productStock')),
    };

    try {
        const url = currentProductId 
            ? `/api/products/${currentProductId}`
            : '/api/products';
        
        const method = currentProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) throw new Error('Failed to save product');

        // Handle image upload if a new image was selected
        const imageFile = formData.get('productImage');
        if (imageFile && imageFile.size > 0) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);
            
            const uploadResponse = await fetch(`/api/products/${currentProductId || response.id}/image`, {
                method: 'POST',
                body: imageFormData
            });
            
            if (!uploadResponse.ok) throw new Error('Failed to upload image');
        }

        showNotification(
            `Product ${currentProductId ? 'updated' : 'added'} successfully`,
            'success'
        );
        
        closeModal();
        await loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Error saving product', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete product');

        showNotification('Product deleted successfully', 'success');
        await loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Error deleting product', 'error');
    }
}

async function editProduct(productId) {
    openModal(productId);
}

// Utility function for showing notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === productModal) {
        closeModal();
    }
}

// Add notification styles dynamically
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    }
    
    .notification.success {
        background-color: var(--success-color);
    }
    
    .notification.error {
        background-color: var(--danger-color);
    }
    
    .notification.fade-out {
        animation: fadeOut 0.5s ease-out forwards;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes fadeOut {
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);