const productContent = document.getElementById("productContent");
const productId = new URLSearchParams(window.location.search).get("id");
const product = products.find(item => item.id === productId);

function showProduct() {
  if (!product) {
    productContent.innerHTML = '<div class="not-found"><h1>محصول پیدا نشد</h1><a href="index.html">بازگشت به فروشگاه</a></div>';
    return;
  }

  productContent.innerHTML = `
    <div class="detail-layout">
      <section class="gallery">
        <img class="main-image" id="mainImage" src="${product.image}" alt="${product.name}">
      </section>
      <section class="product-details">
        <h1>${product.name}</h1>
        <div class="detail-price">${formatPrice(product.price)}</div>
        <div class="detail-meta">
          <div>دسته‌بندی: <span>${categoryNames[product.category]}</span></div>
          <div>وضعیت موجودی: <span>${product.stock > 0 ? "موجود" : "ناموجود"}</span></div>
        </div>
        <p class="detail-description">${product.description}</p>
        <div class="quantity-box">
          <span>تعداد:</span>
          <button id="decreaseQuantity" type="button" aria-label="کم کردن تعداد">−</button>
          <strong id="quantityValue">۱</strong>
          <button id="increaseQuantity" type="button" aria-label="زیاد کردن تعداد">+</button>
        </div>
        <button id="addToCartDetail" class="add-cart-detail" type="button" ${product.stock <= 0 ? "disabled" : ""}>
          ${product.stock > 0 ? "افزودن به سبد خرید" : "ناموجود"}
        </button>
        <p id="detailMessage" class="detail-message" role="status"></p>
      </section>
    </div>
  `;

  setupQuantity();
}

function setupQuantity() {
  let quantity = 1;
  const value = document.getElementById("quantityValue");
  const addButton = document.getElementById("addToCartDetail");
  const message = document.getElementById("detailMessage");

  document.getElementById("decreaseQuantity").addEventListener("click", () => {
    if (quantity > 1) quantity--;
    value.textContent = quantity.toLocaleString("fa-IR");
  });

  document.getElementById("increaseQuantity").addEventListener("click", () => {
    if (quantity < product.stock) quantity++;
    value.textContent = quantity.toLocaleString("fa-IR");
  });

  addButton.addEventListener("click", () => {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    const currentQuantity = existing ? existing.quantity : 0;

    if (currentQuantity + quantity > product.stock) {
      message.textContent = "تعداد انتخاب‌شده از موجودی بیشتر است.";
      return;
    }

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: product.id, quantity });
    }

    saveCart(cart);
    message.textContent = "محصول به سبد خرید اضافه شد.";
  });
}

showProduct();
