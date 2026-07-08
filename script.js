const products = [
  {
    id: 1,
    name: "Смарт-годинник",
    price: 39,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
  },
  {
    id: 2,
    name: "Навушники Bluetooth",
    price: 25,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
  },
  {
    id: 3,
    name: "Power Bank",
    price: 19,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600"
  },
  {
    id: 4,
    name: "Зарядний кабель",
    price: 7,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600"
  },
  {
    id: 5,
    name: "Портативна колонка",
    price: 32,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"
  },
  {
    id: 6,
    name: "Чохол для телефону",
    price: 10,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=600"
  }
];

let cart = [];

function renderProducts() {
  const container = document.getElementById("products");
  const search = document.getElementById("searchInput").value.toLowerCase();

  container.innerHTML = "";

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(search));

  if (filteredProducts.length === 0) {
    container.innerHTML = `<p>Товар не знайдено.</p>`;
    return;
  }

  filteredProducts.forEach(product => {
    container.innerHTML += `
      <div class="card">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">${product.price} €</p>
        <button onclick="addToCart(${product.id})">Додати в кошик</button>
      </div>
    `;
  });
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
}

function updateCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").innerText = totalQuantity;

  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `<p>Кошик порожній.</p>`;
  }

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>${item.price * item.quantity} € <button onclick="removeItem(${index})">❌</button></span>
      </div>
    `;
  });

  document.getElementById("totalPrice").innerText = total;
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

function toggleCart() {
  const panel = document.getElementById("cartPanel");
  panel.style.display = panel.style.display === "flex" ? "none" : "flex";
}

function sendOrder() {
  const name = document.getElementById("clientName").value.trim();
  const phone = document.getElementById("clientPhone").value.trim();
  const comment = document.getElementById("clientComment").value.trim();

  if (cart.length === 0) {
    alert("Кошик порожній");
    return;
  }

  if (!name || !phone) {
    alert("Введіть імʼя і телефон");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let orderText = `Нове замовлення:\n`;
  orderText += `Імʼя: ${name}\n`;
  orderText += `Телефон: ${phone}\n`;
  orderText += `Коментар: ${comment || "-"}\n\n`;
  orderText += `Товари:\n`;

  cart.forEach(item => {
    orderText += `- ${item.name} × ${item.quantity} — ${item.price * item.quantity} €\n`;
  });

  orderText += `\nРазом: ${total} €`;

  const telegramUsername = "YOUR_TELEGRAM_USERNAME";

  if (telegramUsername === "YOUR_TELEGRAM_USERNAME") {
    alert("Замініть YOUR_TELEGRAM_USERNAME у файлі script.js на свій Telegram username.");
    return;
  }

  window.open(`https://t.me/${telegramUsername}?text=${encodeURIComponent(orderText)}`, "_blank");
}

renderProducts();
updateCart();
