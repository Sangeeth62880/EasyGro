document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const toggleFormLink = document.getElementById("toggleForm");

    if (toggleFormLink) {
        toggleFormLink.addEventListener("click", (e) => {
            e.preventDefault();
            loginForm.classList.toggle("hidden");
            signupForm.classList.toggle("hidden");

            toggleFormLink.textContent = loginForm.classList.contains("hidden")
                ? "Already have an account? Log in"
                : "Don't have an account? Sign up";
        });
    }

    // 🔵 Handle Signup
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Ensure correct element selection
            const username = document.querySelector("#signup-username").value.trim();
            const password = document.querySelector("#signup-password").value.trim();

            if (!username || !password) {
                alert("Please enter a valid username and password.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5001/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                alert(data.message);

                if (response.ok) {
                    signupForm.reset();
                    loginForm.classList.remove("hidden");
                    signupForm.classList.add("hidden");
                    toggleFormLink.textContent = "Don't have an account? Sign up";
                }
            } catch (error) {
                console.error("Signup Error:", error);
            }
        });
    }

    // 🟢 Handle Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Ensure correct element selection
            const username = document.querySelector("#login-username").value.trim();
            const password = document.querySelector("#login-password").value.trim();

            if (!username || !password) {
                alert("Please enter a valid username and password.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5001/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    alert("Login successful!");
                    window.location.href = "index.html"; // Redirect to homepage
                } else {
                    alert(data.error);
                }
            } catch (error) {
                console.error("Login Error:", error);
            }
        });
    }
});
