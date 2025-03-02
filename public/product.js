/**
 * EasyGro Profile Management
 * @author Sangeeth62880
 * @lastUpdated 2025-03-02 14:29:31 UTC
 */

// User Configuration
const USER_CONFIG = {
    username: 'Sangeeth62880',
    lastUpdated: '2025-03-02 14:29:31',
    defaultTheme: 'light',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    validImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// Theme Management
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
    try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            body.setAttribute("data-theme", savedTheme);
            return;
        }
        
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        body.setAttribute("data-theme", prefersDark ? "dark" : "light");
        localStorage.setItem("theme", prefersDark ? "dark" : "light");
    } catch (error) {
        console.error("Theme initialization failed:", error);
        body.setAttribute("data-theme", USER_CONFIG.defaultTheme);
    }
};

// Theme toggle handler with error handling
themeToggle?.addEventListener("click", () => {
    try {
        const currentTheme = body.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        
        // Update dark mode toggle if it exists
        const darkModeToggle = document.getElementById("darkModeToggle");
        if (darkModeToggle) {
            darkModeToggle.checked = newTheme === "dark";
        }
    } catch (error) {
        console.error("Theme toggle failed:", error);
        showNotification("Theme toggle failed. Please try again.", "error");
    }
});

// Current time display with locale and error handling
function updateTime() {
    try {
        const currentTime = document.getElementById("currentTime");
        if (!currentTime) return;

        const now = new Date();
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        currentTime.textContent = now.toLocaleTimeString(undefined, options);
    } catch (error) {
        console.error("Time update failed:", error);
    }
}

// Set up time update interval
const timeInterval = setInterval(updateTime, 1000);
updateTime();

// Cleanup interval on page unload
window.addEventListener('unload', () => clearInterval(timeInterval));

// Mobile navigation toggle with error handling
const navToggle = document.querySelector(".nav__toggle");
const navList = document.querySelector(".nav__list");

navToggle?.addEventListener("click", (e) => {
    try {
        e.preventDefault();
        navToggle.classList.toggle("active");
        navList?.classList.toggle("active");
        
        // Update aria-expanded
        const isExpanded = navToggle.classList.contains("active");
        navToggle.setAttribute("aria-expanded", isExpanded.toString());
    } catch (error) {
        console.error("Navigation toggle failed:", error);
    }
});

// Close mobile nav on click outside
document.addEventListener("click", (e) => {
    if (!navToggle?.contains(e.target) && !navList?.contains(e.target)) {
        navToggle?.classList.remove("active");
        navList?.classList.remove("active");
        navToggle?.setAttribute("aria-expanded", "false");
    }
});

// User menu dropdown with accessibility
const userMenuTrigger = document.querySelector(".user-menu__trigger");
const userMenuDropdown = document.querySelector(".user-menu__dropdown");

userMenuTrigger?.addEventListener("click", (e) => {
    try {
        e.stopPropagation();
        const isExpanded = userMenuDropdown?.classList.toggle("active") ?? false;
        userMenuTrigger.setAttribute("aria-expanded", isExpanded.toString());
    } catch (error) {
        console.error("User menu toggle failed:", error);
    }
});

// Close user menu on click outside
document.addEventListener("click", () => {
    userMenuDropdown?.classList.remove("active");
    userMenuTrigger?.setAttribute("aria-expanded", "false");
});

// Tabs functionality with keyboard navigation
const tabTriggers = document.querySelectorAll(".tabs__trigger");
const tabPanels = document.querySelectorAll(".tabs__panel");

tabTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        try {
            const tabId = trigger.getAttribute("data-tab");
            
            // Update triggers
            tabTriggers.forEach((t) => {
                t.classList.remove("active");
                t.setAttribute("aria-selected", "false");
            });
            trigger.classList.add("active");
            trigger.setAttribute("aria-selected", "true");
            
            // Update panels
            tabPanels.forEach((p) => p.classList.remove("active"));
            const activePanel = document.querySelector(`[data-tab-content="${tabId}"]`);
            activePanel?.classList.add("active");
            
            // Save active tab
            localStorage.setItem("activeProfileTab", tabId);
        } catch (error) {
            console.error("Tab switch failed:", error);
        }
    });
});

// Keyboard navigation for tabs
tabTriggers.forEach((trigger, index) => {
    trigger.addEventListener("keydown", (e) => {
        let targetIndex;
        
        switch (e.key) {
            case "ArrowLeft":
                targetIndex = index - 1;
                if (targetIndex < 0) targetIndex = tabTriggers.length - 1;
                break;
            case "ArrowRight":
                targetIndex = index + 1;
                if (targetIndex >= tabTriggers.length) targetIndex = 0;
                break;
            default:
                return;
        }
        
        tabTriggers[targetIndex].click();
        tabTriggers[targetIndex].focus();
        e.preventDefault();
    });
});

// Restore active tab
const restoreActiveTab = () => {
    try {
        const activeTab = localStorage.getItem("activeProfileTab");
        if (activeTab) {
            const trigger = document.querySelector(`[data-tab="${activeTab}"]`);
            trigger?.click();
        }
    } catch (error) {
        console.error("Tab restoration failed:", error);
    }
};

// Initialize active tab
restoreActiveTab();

// Accordion functionality with accessibility
const accordionTriggers = document.querySelectorAll(".accordion__trigger");

accordionTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        try {
            const parent = trigger.parentElement;
            const content = parent?.querySelector(".accordion__content");
            const isActive = parent?.classList.contains("active");
            
            // Close all accordion items
            document.querySelectorAll(".accordion__item").forEach((item) => {
                item.classList.remove("active");
                const itemTrigger = item.querySelector(".accordion__trigger");
                itemTrigger?.setAttribute("aria-expanded", "false");
            });
            
            // Open clicked item if it wasn't active
            if (!isActive && parent && content) {
                parent.classList.add("active");
                trigger.setAttribute("aria-expanded", "true");
            }
        } catch (error) {
            console.error("Accordion toggle failed:", error);
        }
    });
});

// Form validation with enhanced error handling
const profileForm = document.getElementById("profileForm");
const formInputs = profileForm?.querySelectorAll("input, textarea");

function validateInput(input) {
    if (!input) return false;
    const parent = input.parentElement;
    if (!parent) return false;

    const errorElement = parent.querySelector(".form__error");
    if (!errorElement) return false;

    try {
        // Clear previous error
        parent.classList.remove("error");
        errorElement.textContent = "";

        // Required field validation
        if (input.required && !input.value.trim()) {
            parent.classList.add("error");
            errorElement.textContent = "This field is required";
            return false;
        }

        // Email validation
        if (input.type === "email" && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                parent.classList.add("error");
                errorElement.textContent = "Please enter a valid email address";
                return false;
            }
        }

        // Phone validation
        if (input.type === "tel" && input.value) {
            const phoneRegex = /^\+?[\d\s-()]{10,}$/;
            if (!phoneRegex.test(input.value)) {
                parent.classList.add("error");
                errorElement.textContent = "Please enter a valid phone number";
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error("Input validation failed:", error);
        return false;
    }
}

// Form input validation handlers
formInputs?.forEach((input) => {
    input.addEventListener("blur", () => validateInput(input));
    input.addEventListener("input", () => {
        if (input.parentElement?.classList.contains("error")) {
            validateInput(input);
        }
    });
});

// Form submission handler with success message
profileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    let isValid = true;

    try {
        formInputs?.forEach((input) => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Show loading state
            const submitButton = profileForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            showNotification("Profile updated successfully!", "success");

            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    } catch (error) {
        console.error("Form submission failed:", error);
        showNotification("Failed to update profile. Please try again.", "error");
    }
});

// Notification system
function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `alert alert--${type}`;
    notification.setAttribute("role", "alert");
    
    notification.innerHTML = `
        <svg class="alert__icon" viewBox="0 0 24 24" width="24" height="24">
            ${type === "success" ? '<path d="M20 6L9 17l-5-5"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/>'}
        </svg>
        <div class="alert__content">
            <p class="alert__description">${message}</p>
        </div>
    `;

    const container = document.querySelector(".profile__header");
    container?.insertAdjacentElement("afterend", notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Avatar upload preview with validation
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

avatarInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file || !avatarPreview) return;

    try {
        // Validate file type
        if (!USER_CONFIG.validImageTypes.includes(file.type)) {
            showNotification("Please select a valid image file (JPEG, PNG, GIF, or WebP)", "error");
            return;
        }

        // Validate file size
        if (file.size > USER_CONFIG.maxFileSize) {
            showNotification("File size must be less than 5MB", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (avatarPreview && e.target?.result) {
                avatarPreview.src = e.target.result.toString();
            }
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error("Avatar upload failed:", error);
        showNotification("Failed to upload image. Please try again.", "error");
    }
});

// Initialize dark mode toggle
const darkModeToggle = document.getElementById("darkModeToggle");
if (darkModeToggle) {
    darkModeToggle.checked = body.getAttribute("data-theme") === "dark";
    darkModeToggle.addEventListener("change", () => {
        const newTheme = darkModeToggle.checked ? "dark" : "light";
        body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

// Initialize theme on page load
initializeTheme();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateInput,
        showNotification,
        USER_CONFIG
    };
}