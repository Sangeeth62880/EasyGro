document.addEventListener("DOMContentLoaded", async () => {
    const productGrid = document.querySelector(".product-grid");
    const cartCount = document.querySelector(".cart-count");
    const popup = document.getElementById("popup");
    const filterSelect = document.getElementById("filter-options");
    const sortSelect = document.getElementById("sort-options"); // Changed this line
    let user_id = localStorage.getItem("user_id") || "guest";

    // Fetch products from server
    async function loadProducts(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.sortPrice) queryParams.append('sortPrice', filters.sortPrice);

            const response = await fetch(`http://localhost:5001/products/filter?${queryParams}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const products = await response.json();

            productGrid.innerHTML = products.map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <h2>${product.name}</h2>
                    <p class="price">$${product.price}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `).join('');

            attachCartListeners();
        } catch (error) {
            console.error("Error loading products:", error);
        }
    }

    async function updateCartCount() {
        try {
            // Get or create cart count element
            let cartCount = document.querySelector("#cart-count");
            if (!cartCount) {
                cartCount = document.createElement('span');
                cartCount.className = 'cart-count';
                const cartIcon = document.getElementById('.cart-icon');
                if (cartIcon) {
                    cartIcon.appendChild(cartCount);
                } else {
                    console.warn('Cart icon not found, creating new container');
                    const container = document.createElement('div');
                    container.className = 'cart-container';
                    container.appendChild(cartCount);
                    document.querySelector('header').appendChild(container);
                }
            }

            // Fetch and update cart count
            const user_id = localStorage.getItem("user_id");
            if (!user_id) {
                cartCount.textContent = '0';
                return;
            }

            const response = await fetch(`http://localhost:5001/cart/${user_id}`);
            const cartItems = await response.json();
            cartCount.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        } catch (error) {
            console.error("Error updating cart count:", error);
            // Set default value on error
            const cartCount = document.querySelector(".cart-count");
            if (cartCount) cartCount.textContent = '0';
        }
    }

    function showPopup(message) {
        let popup = document.getElementById("popup");

        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'popup';
            document.body.appendChild(popup);
        }

        popup.className = 'popup';
        popup.textContent = message;
        popup.style.display = "block";

        setTimeout(() => {
            popup.style.display = "none";
        }, 2000);
    }

    function attachCartListeners() {
        const cartButtons = document.querySelectorAll(".add-to-cart");
        cartButtons.forEach(button => {
            button.addEventListener("click", async (e) => {
                const user_id = localStorage.getItem("user_id");

                // Redirect to login if not logged in
                if (!user_id || user_id === 'guest') {
                    window.location.href = '/login.html';
                    return;
                }

                const product_id = e.target.dataset.id;
                try {
                    const response = await fetch("http://localhost:5001/cart", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            user_id: parseInt(user_id),
                            product_id: parseInt(product_id)
                        })
                    });

                    if (!response.ok) throw new Error('Failed to add to cart');

                    showPopup("Item added to cart!");
                    await updateCartCount();

                } catch (error) {
                    console.error("Error adding to cart:", error);
                    showPopup("Failed to add item to cart");
                }
            });
        });
    }

    // Add event listeners only if elements exist
    if (filterSelect) {
        filterSelect.addEventListener("change", () => {
            const filters = {
                category: filterSelect.value,
                sortPrice: sortSelect ? sortSelect.value : ''
            };
            loadProducts(filters);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            const filters = {
                category: filterSelect ? filterSelect.value : 'all',
                sortPrice: sortSelect.value
            };
            loadProducts(filters);
        });
    }

    // Initial load
    await loadProducts();
    updateCartCount();
});
