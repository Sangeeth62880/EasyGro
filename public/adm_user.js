document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const userModal = document.getElementById('userModal');
    const confirmModal = document.getElementById('confirmModal');
    const userForm = document.getElementById('userForm');
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const addUserBtn = document.querySelector('.add-user-btn');
    const closeBtns = document.getElementsByClassName('close-btn');
    let currentUserId = null;

    // Constants
    const ADMIN_USERNAME = 'Sangeeth62880'; // Current admin username
    const DATETIME_FORMAT = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

// Add this at the top of your adm_user.js file after document.addEventListener('DOMContentLoaded'...)

// Update current date time
function updateDateTime() {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    document.getElementById('currentDateTime').textContent = formattedDate;
}

// Update initially and then every second
updateDateTime();
setInterval(updateDateTime, 1000);

// Set current user
document.getElementById('currentUserName').textContent = 'Sangeeth62880';

// You can also fetch this info from the server
fetch('/api/admin/info')
    .then(response => response.json())
    .then(data => {
        document.getElementById('currentUserName').textContent = data.username;
        document.getElementById('currentDateTime').textContent = data.currentDateTime;
    })
    .catch(error => console.error('Error fetching admin info:', error));

    // Navigation links update
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === 'users.html') {
            link.setAttribute('href', 'adm_user.html');
        }
    });

    // Close modals when clicking close buttons
    Array.from(closeBtns).forEach(btn => {
        btn.addEventListener('click', () => {
            userModal.style.display = 'none';
            confirmModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === userModal || e.target === confirmModal) {
            userModal.style.display = 'none';
            confirmModal.style.display = 'none';
        }
    });

    // Load users on page load
    loadUsers();
    updateUserStats();

    // Search functionality
    searchInput.addEventListener('input', debounce(() => {
        filterUsers();
    }, 300));

    // Filter change handlers
    roleFilter.addEventListener('change', filterUsers);
    statusFilter.addEventListener('change', filterUsers);

    // Form submission handler
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value,
            status: document.getElementById('status').value,
            last_updated: getCurrentUTCDateTime()
        };

        try {
            if (currentUserId) {
                await updateUser(currentUserId, userData);
            } else {
                userData.created_at = getCurrentUTCDateTime();
                await createUser(userData);
            }
            userModal.style.display = 'none';
            loadUsers();
            updateUserStats();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // Functions
    async function loadUsers() {
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    function displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            const isCurrentAdmin = user.username === ADMIN_USERNAME;
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td><span class="role-badge ${user.role}-role">${user.role}</span></td>
                <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
                <td>${formatDate(user.last_login)}</td>
                <td>
                    ${!isCurrentAdmin ? `
                        <button class="action-btn edit-btn" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                            <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn status-btn" onclick="toggleUserStatus(${user.id})">
                            <i class="fas fa-power-off"></i>
                        </button>
                    ` : '<span class="current-user-badge">Current Admin</span>'}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async function updateUserStats() {
        try {
            const response = await fetch('/api/users/stats');
            const stats = await response.json();
            document.getElementById('totalUsers').textContent = stats.total;
            document.getElementById('totalAdmins').textContent = stats.admins;
            document.getElementById('regularUsers').textContent = stats.regular;
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        const roleValue = roleFilter.value;
        const statusValue = statusFilter.value;

        const rows = document.querySelectorAll('#usersTableBody tr');
        rows.forEach(row => {
            const username = row.cells[1].textContent.toLowerCase();
            const role = row.cells[2].textContent.toLowerCase();
            const status = row.cells[3].textContent.toLowerCase();

            const matchesSearch = username.includes(searchTerm);
            const matchesRole = roleValue === 'all' || role === roleValue;
            const matchesStatus = statusValue === 'all' || status === statusValue;

            row.style.display = matchesSearch && matchesRole && matchesStatus ? '' : 'none';
        });
    }

    function openModal(userId = null) {
        currentUserId = userId;
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = userId ? 'Edit User' : 'Add New User';
        
        if (userId) {
            fetch(`/api/users/${userId}`)
                .then(res => res.json())
                .then(user => {
                    document.getElementById('username').value = user.username;
                    document.getElementById('password').value = '';
                    document.getElementById('role').value = user.role;
                    document.getElementById('status').value = user.status;
                })
                .catch(error => console.error('Error loading user:', error));
        } else {
            userForm.reset();
        }
        
        userModal.style.display = 'block';
    }

    async function createUser(userData) {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to create user');
        }
    }

    async function updateUser(userId, userData) {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }
    }

    async function deleteUser(userId) {
        confirmModal.style.display = 'block';
        document.getElementById('confirmMessage').textContent = 'Are you sure you want to delete this user?';
        
        document.querySelector('.confirm-btn').onclick = async () => {
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete user');
                }

                confirmModal.style.display = 'none';
                loadUsers();
                updateUserStats();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        };

        document.querySelector('.cancel-btn').onclick = () => {
            confirmModal.style.display = 'none';
        };
    }

    async function toggleUserStatus(userId) {
        try {
            const response = await fetch(`/api/users/${userId}/toggle-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ last_updated: getCurrentUTCDateTime() })
            });

            if (!response.ok) {
                throw new Error('Failed to toggle user status');
            }

            loadUsers();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    // Utility functions
    function formatDate(dateString) {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', DATETIME_FORMAT);
    }

    function getCurrentUTCDateTime() {
        const now = new Date();
        return now.toISOString().slice(0, 19).replace('T', ' ');
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
    window.editUser = (userId) => openModal(userId);
    window.deleteUser = deleteUser;
    window.toggleUserStatus = toggleUserStatus;
});