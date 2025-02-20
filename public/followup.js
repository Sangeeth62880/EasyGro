document.addEventListener('DOMContentLoaded', function() {
    // Retrieve user data from localStorage (assuming it was saved there from the profile page)
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (userData) {
        // Update the DOM with user data
        document.getElementById('userName').textContent = userData.name || 'Not provided';
        document.getElementById('userEmail').textContent = userData.email || 'Not provided';
        document.getElementById('userPhone').textContent = userData.phone || 'Not provided';
        document.getElementById('userAddress').textContent = userData.address || 'Not provided';
        document.getElementById('userBio').textContent = userData.bio || 'No bio provided';
        
        // Update profile image if available
        if (userData.imageUrl) {
            document.getElementById('userImage').src = userData.imageUrl;
        }
    } else {
        // Handle case where no user data is found
        alert('No user data found. Please complete your profile first.');
        window.location.href = 'profile.html';
    }
});

// Function to go back to edit profile page
function goToEdit() {
    window.location.href = 'profile.html';
}