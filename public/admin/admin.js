document.addEventListener("DOMContentLoaded", fetchUsers);

async function fetchUsers() {
    try {
        const response = await fetch("/admin/get-users");
        const users = await response.json();
        const tableBody = document.getElementById("userTable");
        tableBody.innerHTML = "";

        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><button onclick="deleteUser(${user.id})">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

async function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        try {
            await fetch(`/admin/delete-user/${userId}`, { method: "DELETE" });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }
}

async function logout() {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/login.html";
}
