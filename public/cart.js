document.addEventListener("DOMContentLoaded", async () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalItemsElement = document.getElementById("total-items");
  const subtotalElement = document.getElementById("subtotal");
  const taxElement = document.getElementById("tax");
  const totalPriceElement = document.getElementById("total-price");

  let user_id = localStorage.getItem("user_id") || "guest";

  async function fetchCart() {
      try {
          const response = await fetch(`http://localhost:5001/cart/${user_id}`);
          const cartItems = await response.json();

          cartItemsContainer.innerHTML = "";
          let totalItems = 0;
          let subtotal = 0;

          cartItems.forEach(item => {
              totalItems += item.quantity;
              subtotal += item.price * item.quantity;

              const cartItemElement = document.createElement("div");
              cartItemElement.innerHTML = `
                  <img src="${item.image}" alt="${item.name}">
                  <h3>${item.name}</h3>
                  <p>$${item.price.toFixed(2)}</p>
                  <span>Quantity: ${item.quantity}</span>
                  <button onclick="removeFromCart(${item.id})">Remove</button>
              `;
              cartItemsContainer.appendChild(cartItemElement);
          });

          const tax = subtotal * 0.1;
          const total = subtotal + tax;

          totalItemsElement.textContent = totalItems;
          subtotalElement.textContent = subtotal.toFixed(2);
          taxElement.textContent = tax.toFixed(2);
          totalPriceElement.textContent = total.toFixed(2);
      } catch (error) {
          console.error("Error fetching cart:", error);
      }
  }

  fetchCart();
});
