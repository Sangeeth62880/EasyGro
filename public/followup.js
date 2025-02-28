// Constants
const CONFIG = {
    currentUser: 'Sangeeth62880',
    dateFormat: 'YYYY-MM-DD HH:MM:SS',
    updateInterval: 1000,
};

// Utility Functions
const formatDate = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Theme Manager
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        this.themeToggle?.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' 
                ? 'light' 
                : 'dark';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }
}

// Time Display Manager
class TimeDisplay {
    constructor() {
        this.timeElement = document.getElementById('currentTime');
        this.updateTime();
        setInterval(() => this.updateTime(), CONFIG.updateInterval);
    }

    updateTime() {
        if (!this.timeElement) return;
        const now = new Date();
        const formattedTime = formatDate(now);
        this.timeElement.innerHTML = `
            <i class="far fa-clock"></i>
            <span>${formattedTime}</span>
        `;
    }
}

// Profile Manager
class ProfileManager {
    constructor() {
        this.elements = {
            image: document.getElementById('userImage'),
            name: document.getElementById('userName'),
            email: document.getElementById('userEmail'),
            phone: document.getElementById('userPhone'),
            address: document.getElementById('userAddress'),
            bio: document.getElementById('userBio')
        };
        this.loadProfile();
        this.setupImageUpload();
    }

    async loadProfile() {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch(`http://localhost:5001/users/${userId}`);
            if (!response.ok) throw new Error('Failed to load profile');

            const userData = await response.json();
            this.updateProfile(userData);
        } catch (error) {
            console.error('Error loading profile:', error);
            NotificationManager.show('Failed to load profile data', 'error');
        }
    }

    updateProfile(userData) {
        if (this.elements.image) {
            this.elements.image.src = userData.image || 'default-avatar.png';
        }
        if (this.elements.name) {
            this.elements.name.textContent = userData.name || CONFIG.currentUser;
        }
        if (this.elements.email) {
            this.elements.email.textContent = userData.email || 'Not provided';
        }
        if (this.elements.phone) {
            this.elements.phone.textContent = userData.phone || 'Not provided';
        }
        if (this.elements.address) {
            this.elements.address.textContent = userData.address || 'Not provided';
        }
        if (this.elements.bio) {
            this.elements.bio.textContent = userData.bio || 'No bio provided';
        }
    }

    setupImageUpload() {
        const imageContainer = document.querySelector('.image-container');
        if (!imageContainer) return;

        imageContainer.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => this.handleImageUpload(e);
            input.click();
        });
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);
            const userId = localStorage.getItem('user_id');

            const response = await fetch(`http://localhost:5001/users/${userId}/image`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const result = await response.json();
            this.elements.image.src = result.imageUrl;
            NotificationManager.show('Profile picture updated successfully', 'success');
        } catch (error) {
            console.error('Error uploading image:', error);
            NotificationManager.show('Failed to update profile picture', 'error');
        }
    }
}

// Notification Manager
class NotificationManager {
    static show(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.className = `notification ${type}`;
        notification.querySelector('.notification__message').textContent = message;
        notification.classList.add('active');

        const closeBtn = notification.querySelector('.notification__close');
        if (closeBtn) {
            closeBtn.onclick = () => notification.classList.remove('active');
        }

        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
}

// Navigation Manager
class NavigationManager {
    constructor() {
        this.navToggle = document.querySelector('.nav__toggle');
        this.navList = document.querySelector('.nav__list');
        this.init();
    }

    init() {
        if (!this.navToggle || !this.navList) return;

        this.navToggle.addEventListener('click', () => {
            this.navList.classList.toggle('active');
            this.updateToggleIcon();
        });

        // Close navigation when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navToggle.contains(e.target) && !this.navList.contains(e.target)) {
                this.navList.classList.remove('active');
                this.updateToggleIcon();
            }
        });
    }

    updateToggleIcon() {
        const icon = this.navToggle.querySelector('i');
        if (icon) {
            icon.className = this.navList.classList.contains('active') 
                ? 'fas fa-times' 
                : 'fas fa-bars';
        }
    }
}

// Edit Profile Navigation
function goToEdit() {
    window.location.href = '/edit-profile.html';
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new TimeDisplay();
    new ProfileManager();
    new NavigationManager();

    // Handle notification close buttons
    document.querySelectorAll('.notification__close').forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.closest('.notification').classList.remove('active');
        });
    });
});