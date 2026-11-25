const productList = document.querySelector(".product-list");
const productSearch = document.getElementById("productSearch");
const categoryFilter = document.getElementById("categoryFilter");
const priceSort = document.getElementById("priceSort");

const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");

let cart = getCart();

function renderProducts() {
  const searchText = productSearch.value.trim().toLocaleLowerCase("fa");
  const selectedCategory = categoryFilter.value;
  const sortValue = priceSort.value;

  let visibleProducts = products.filter(product => {
    const matchesName = product.name.toLocaleLowerCase("fa").includes(searchText);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesName && matchesCategory;
  });

  if (sortValue === "low") visibleProducts.sort((a, b) => a.price - b.price);
  if (sortValue === "high") visibleProducts.sort((a, b) => b.price - a.price);

  productList.replaceChildren();

  if (!visibleProducts.length) {
    const message = document.createElement("p");
    message.className = "products-description";
    message.textContent = "محصولی با این مشخصات پیدا نشد.";
    productList.appendChild(message);
    return;
  }

  visibleProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.category = product.category;
    card.addEventListener("click", event => {
      if (!event.target.closest("button")) {
        window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
      }
    });

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    image.addEventListener("error", () => image.hidden = true);

    const info = document.createElement("div");
    info.className = "product-info";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = formatPrice(product.price);

    const stock = document.createElement("p");
    stock.textContent = product.stock > 0
      ? `موجودی: ${product.stock.toLocaleString("fa-IR")}`
      : "ناموجود";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = product.stock > 0 ? "افزودن به سبد خرید" : "ناموجود";
    button.disabled = product.stock <= 0;
    button.addEventListener("click", () => addToCart(product.id));

    info.append(name, price, stock, button);
    card.append(image, info);
    productList.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find(item => item.id === String(productId));
  if (!product) return;

  const existing = cart.find(item => item.id === product.id);
  const quantity = existing ? existing.quantity : 0;

  if (quantity >= product.stock) {
    alert("تعداد درخواستی از موجودی بیشتر است.");
    return;
  }

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  updateCart();
}

function updateCart() {
  cart = cart.filter(item => {
    const product = products.find(entry => entry.id === item.id);
    return product && item.quantity <= product.stock;
  });

  cartItems.replaceChildren();
  let count = 0;
  let total = 0;

  cart.forEach(item => {
    const product = products.find(entry => entry.id === item.id);
    if (!product) return;

    count += item.quantity;
    total += product.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";

    const info = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = formatPrice(product.price * item.quantity);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "کم کردن تعداد");
    minus.addEventListener("click", () => changeQuantity(item.id, -1));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity.toLocaleString("fa-IR");

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "زیاد کردن تعداد");
    plus.disabled = item.quantity >= product.stock;
    plus.addEventListener("click", () => changeQuantity(item.id, 1));

    controls.append(minus, quantity, plus);
    info.append(name, price, controls);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-item";
    remove.textContent = "حذف";
    remove.addEventListener("click", () => {
      cart = cart.filter(entry => entry.id !== item.id);
      updateCart();
    });

    row.append(info, remove);
    cartItems.appendChild(row);
  });

  if (!cart.length) cartItems.textContent = "سبد خرید شما خالی است.";
  cartCount.textContent = count.toLocaleString("fa-IR");
  cartTotal.textContent = total.toLocaleString("fa-IR");
  checkoutButton.disabled = cart.length === 0;
  saveCart(cart);
}

function changeQuantity(productId, change) {
  const item = cart.find(entry => entry.id === productId);
  const product = products.find(entry => entry.id === productId);
  if (!item || !product) return;

  const nextQuantity = item.quantity + change;
  if (nextQuantity < 1) {
    cart = cart.filter(entry => entry.id !== productId);
  } else if (nextQuantity <= product.stock) {
    item.quantity = nextQuantity;
  }

  updateCart();
}

cartButton.addEventListener("click", () => cartPanel.classList.add("open"));
closeCart.addEventListener("click", () => cartPanel.classList.remove("open"));

checkoutButton.addEventListener("click", () => {
  if (!cart.length) return;
  window.location.href = "checkout.html";
});

productSearch.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
priceSort.addEventListener("change", renderProducts);

document.querySelectorAll(".category-card").forEach((card, index) => {
  const categories = ["formal", "manteau", "casual", "sport"];
  card.addEventListener("click", () => {
    categoryFilter.value = categories[index];
    renderProducts();
  });
});

renderProducts();
updateCart();
