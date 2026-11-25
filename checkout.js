const checkoutForm = document.getElementById("checkoutForm");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const submitButton = checkoutForm.querySelector('button[type="submit"]');

function loadSummary() {
  const cart = getCart();
  checkoutItems.replaceChildren();
  let total = 0;

  if (!cart.length) {
    checkoutItems.textContent = "سبد خرید شما خالی است.";
    checkoutTotal.textContent = formatPrice(0);
    submitButton.disabled = true;
    return;
  }

  cart.forEach(item => {
    const product = products.find(entry => entry.id === item.id);
    if (!product || item.quantity > product.stock) return;

    const row = document.createElement("div");
    row.className = "checkout-item";

    const name = document.createElement("span");
    name.textContent = product.name;

    const quantity = document.createElement("span");
    quantity.textContent = `${item.quantity.toLocaleString("fa-IR")} عدد`;

    const price = document.createElement("strong");
    price.textContent = formatPrice(product.price * item.quantity);

    total += product.price * item.quantity;
    row.append(name, quantity, price);
    checkoutItems.appendChild(row);
  });

  checkoutTotal.textContent = formatPrice(total);
  if (!checkoutItems.childElementCount) {
    checkoutItems.textContent = "محصولات سبد خرید در دسترس نیستند.";
    submitButton.disabled = true;
  }
}

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();

  const cart = getCart();
  if (!cart.length) {
    alert("سبد خرید شما خالی است.");
    return;
  }

  const customer = {
    name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    province: document.getElementById("customerProvince").value.trim(),
    city: document.getElementById("customerCity").value.trim(),
    address: document.getElementById("customerAddress").value.trim(),
    postalCode: document.getElementById("postalCode").value.trim()
  };

  if (!/^09\d{9}$/.test(customer.phone)) {
    alert("شماره تماس باید ۱۱ رقم و با ۰۹ شروع شود.");
    return;
  }

  if (!/^\d{10}$/.test(customer.postalCode)) {
    alert("کد پستی باید ۱۰ رقم باشد.");
    return;
  }

  const items = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return {
      id: item.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    };
  });

  if (items.some(item => !products.find(product => product.id === item.id) || item.quantity > products.find(product => product.id === item.id).stock)) {
    alert("موجودی یکی از محصولات کافی نیست.");
    return;
  }

  const order = {
    id: Date.now(),
    customer,
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    date: new Date().toISOString()
  };

  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    saveCart([]);
    alert("سفارش آزمایشی شما ثبت شد. این نسخه به درگاه پرداخت متصل نیست.");
    window.location.href = "index.html";
  } catch {
    alert("ثبت سفارش در مرورگر انجام نشد. فضای ذخیره‌سازی را بررسی کنید.");
  }
});

loadSummary();
