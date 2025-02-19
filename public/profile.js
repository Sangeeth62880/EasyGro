document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const profileForm = document.getElementById('profile-form');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const imgUpload = document.getElementById('img-upload');
    const profileImg = document.getElementById('profile-img');
    
    // Store form data
    let formData = {
        name: '',
        email: '',
        phone: '',
        details: ''
    };

    // Store original data for cancel operation
    let originalData = {...formData};

    // Get all input fields
    const inputs = profileForm.querySelectorAll('input:not([type="file"]), textarea');

    // Handle Edit button click
    editBtn.addEventListener('click', function() {
        toggleEditMode(true);
    });

    // Handle Save button click
    saveBtn.addEventListener('click', function() {
        // Here you would typically send the data to a server
        saveFormData();
        toggleEditMode(false);
    });

    // Handle Cancel button click
    cancelBtn.addEventListener('click', function() {
        restoreOriginalData();
        toggleEditMode(false);
    });

    // Handle image upload
    imgUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Toggle edit mode
    function toggleEditMode(isEditing) {
        inputs.forEach(input => {
            input.disabled = !isEditing;
        });

        editBtn.hidden = isEditing;
        saveBtn.hidden = !isEditing;
        cancelBtn.hidden = !isEditing;

        if (isEditing) {
            // Store original data when entering edit mode
            originalData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                details: document.getElementById('details').value
            };
        }
    }

    // Save form data
    function saveFormData() {
        formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            details: document.getElementById('details').value
        };
        
        // Show success message
        showMessage('Profile updated successfully!');
    }

    // Restore original data
    function restoreOriginalData() {
        document.getElementById('name').value = originalData.name;
        document.getElementById('email').value = originalData.email;
        document.getElementById('phone').value = originalData.phone;
        document.getElementById('details').value = originalData.details;
    }

    // Show message function
    function showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});