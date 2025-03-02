// Utility functions for the admin dashboard

const Utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Show toast notification
    showToast: (message, type = 'info') => {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                          type === 'error' ? 'exclamation-circle' :
                          type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <div class="toast-content">
                <p>${message}</p>
            </div>
            <button class="toast-close">×</button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);

        // Close button functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    },

    // Show modal
    showModal: ({ title, content, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
        const modalContainer = document.getElementById('modalContainer');
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">${content}</div>
            <div class="modal-footer">
                <button class="btn btn-outline modal-cancel">${cancelText}</button>
                <button class="btn btn-primary modal-confirm">${confirmText}</button>
            </div>
        `;

        modalContainer.appendChild(modal);
        modalContainer.classList.add('show');

        // Close modal function
        const closeModal = () => {
            modalContainer.classList.remove('show');
            modal.remove();
        };

        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });

        // Close on outside click
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) closeModal();
        });
    },

    // Debounce function for search
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Sort table
    sortTable: (table, column, type = 'string') => {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            let aVal = a.children[column].textContent;
            let bVal = b.children[column].textContent;

            if (type === 'number') {
                aVal = parseFloat(aVal.replace(/[^0-9.-]+/g, ''));
                bVal = parseFloat(bVal.replace(/[^0-9.-]+/g, ''));
            } else if (type === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            return 0;
        });

        // Clear and re-append sorted rows
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
    },

    // Filter table
    filterTable: (table, searchTerm) => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }
};

// Export Utils object
window.Utils = Utils;
