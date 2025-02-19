document.addEventListener("DOMContentLoaded", async function () {
    const productGrid = document.querySelector(".product-grid");

    try {
        const response = await fetch("http://localhost:5000/products");
        const products = await response.json();

        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" class="product-image" alt="${product.name}">
                <h2>${product.name}</h2>
                <p class="price">$${product.price}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error fetching products:", error);
    }


    // Cart Functionality (Basic)
    let cartCount = 0;
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            cartCount++;
            document.getElementById("cart-count").textContent = cartCount;
            this.innerText = "Added!";
            this.style.backgroundColor = "#ff5722";
            setTimeout(() => {
                this.innerText = "Add to Cart";
                this.style.backgroundColor = "#28a745";
            }, 1500);
        });
    });
});