document.addEventListener("DOMContentLoaded", () => {
  const cartButtons = document.querySelectorAll(".add-to-cart");
  const cartCount = document.querySelector(".cart-count");
  const popup = document.getElementById("popup");

  let user_id = localStorage.getItem("user_id") || "guest";

  async function updateCartCount() {
      try {
          const response = await fetch(`http://localhost:5001/cart/${user_id}`);
          const cartItems = await response.json();
          cartCount.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      } catch (error) {
          console.error("Error updating cart count:", error);
      }
  }

  cartButtons.forEach(button => {
      button.addEventListener("click", async (e) => {
          const product_id = e.target.dataset.id;

          try {
              const response = await fetch("http://localhost:5001/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id, product_id, quantity: 1 }),
              });

              if (!response.ok) throw new Error("Failed to add item to cart");

              popup.style.display = "block";
              setTimeout(() => { popup.style.display = "none"; }, 2000);

              updateCartCount();
          } catch (error) {
              console.error("Error adding to cart:", error);
          }
      });
  });

  updateCartCount();
});
document.addEventListener("DOMContentLoaded", () => {
  const cartButtons = document.querySelectorAll(".add-to-cart");
  const cartCount = document.querySelector(".cart-count");
  const popup = document.getElementById("popup");

  let user_id = localStorage.getItem("user_id") || "guest";

  async function updateCartCount() {
      try {
          const response = await fetch(`http://localhost:5001/cart/${user_id}`);
          const cartItems = await response.json();
          cartCount.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      } catch (error) {
          console.error("Error updating cart count:", error);
      }
  }

  cartButtons.forEach(button => {
      button.addEventListener("click", async (e) => {
          const product_id = e.target.dataset.id;

          try {
              const response = await fetch("http://localhost:5001/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id, product_id, quantity: 1 }),
              });

              if (!response.ok) throw new Error("Failed to add item to cart");

              popup.style.display = "block";
              setTimeout(() => { popup.style.display = "none"; }, 2000);

              updateCartCount();
          } catch (error) {
              console.error("Error adding to cart:", error);
          }
      });
  });

  updateCartCount();
});
