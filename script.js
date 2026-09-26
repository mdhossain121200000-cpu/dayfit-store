// ===============================
// DAYFIT EASY SETTINGS
// Change these values before publishing.
// ===============================
const STORE = {
  whatsapp: "8801686235069", // Example: 8801712345678
  phone: "01686235069",
  currency: "৳"
};

// Product list. Replace price, size, colour and images as your real stock changes.
const PRODUCTS = [
  {
    id: 1,
    name: "DAYFIT Premium T-Shirt",
    price: 850,
    image: "assets/tee-black.jpg",
    sizes: ["S","M","L","XL","XXL"],
    colours: ["White","Night Sky","Forest Night","Black"],
    description: "Premium everyday T-shirt with a clean, comfortable fit."
  }
];

let cart = JSON.parse(localStorage.getItem("dayfitCart") || "[]");

const $ = (s) => document.querySelector(s);
const money = (n) => STORE.currency + Number(n).toLocaleString("en-BD");

function saveCart(){
  localStorage.setItem("dayfitCart", JSON.stringify(cart));
}

function renderProducts(){
  $("#productGrid").innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <div class="product-img">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="price">${money(p.price)}</div>
        <div class="product-controls">
          <select id="size-${p.id}" aria-label="Size">
            ${p.sizes.map(s => `<option>${s}</option>`).join("")}
          </select>
          <select id="colour-${p.id}" aria-label="Colour">
            ${p.colours.map(c => `<option>${c}</option>`).join("")}
          </select>
          <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id){
  const p = PRODUCTS.find(x => x.id === id);
  const size = $(`#size-${id}`).value;
  const colour = $(`#colour-${id}`).value;
  const key = `${id}-${size}-${colour}`;
  const found = cart.find(x => x.key === key);
  if(found) found.qty += 1;
  else cart.push({key, id, size, colour, qty:1});
  saveCart();
  renderCart();
  openCart();
}

function changeQty(key, amount){
  const item = cart.find(x => x.key === key);
  if(!item) return;
  item.qty += amount;
  if(item.qty <= 0) cart = cart.filter(x => x.key !== key);
  saveCart();
  renderCart();
}

function renderCart(){
  const count = cart.reduce((sum,x) => sum + x.qty, 0);
  $("#cartCount").textContent = count;

  if(!cart.length){
    $("#cartItems").innerHTML = `<div class="empty">Your cart is empty.</div>`;
    $("#cartTotal").textContent = money(0);
    return;
  }

  let total = 0;
  $("#cartItems").innerHTML = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    total += p.price * item.qty;
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <h4>${p.name}</h4>
          <p>Size: ${item.size} · ${item.colour}</p>
          <p>${money(p.price)} × ${item.qty}</p>
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
            <button class="qty-input" style="width:34px;padding:5px" onclick="changeQty('${item.key}',-1)">−</button>
            <b>${item.qty}</b>
            <button class="qty-input" style="width:34px;padding:5px" onclick="changeQty('${item.key}',1)">+</button>
          </div>
        </div>
        <button class="remove" onclick="changeQty('${item.key}',-${item.qty})">Remove</button>
      </div>
    `;
  }).join("");

  $("#cartTotal").textContent = money(total);
}

function openCart(){
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("open");
}
function closeCart(){
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("open");
}

function openCheckout(){
  if(!cart.length){
    alert("Your cart is empty.");
    return;
  }
  closeCart();
  let total = 0;
  const lines = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    total += p.price * item.qty;
    return `${p.name} — Size ${item.size}, ${item.colour}, Qty ${item.qty}`;
  });
  $("#orderSummary").innerHTML = `<b>Order:</b><br>${lines.join("<br>")}<hr><b>Total: ${money(total)}</b>`;
  $("#checkoutModal").classList.add("open");
}

function closeCheckout(){
  $("#checkoutModal").classList.remove("open");
}

$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
$("#checkoutOpen").addEventListener("click", openCheckout);
$("#checkoutClose").addEventListener("click", closeCheckout);

$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if(STORE.whatsapp.includes("X")){
    alert("Please add your real WhatsApp number in script.js first.");
    return;
  }

  const form = new FormData(e.target);
  let total = 0;
  const items = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    total += p.price * item.qty;
    return `• ${p.name} | Size: ${item.size} | Colour: ${item.colour} | Qty: ${item.qty}`;
  }).join("\n");

  const message =
`*DAYFIT ORDER*
Name: ${form.get("name")}
Mobile: ${form.get("phone")}
Address: ${form.get("address")}
Payment: ${form.get("payment")}

${items}

Total: ${money(total)}`;

  window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
});

$("#whatsappLink").addEventListener("click", (e) => {
  if(STORE.whatsapp.includes("X")){
    e.preventDefault();
    alert("Add your WhatsApp number in script.js first.");
    return;
  }
  e.currentTarget.href = `https://wa.me/${STORE.whatsapp}`;
});

$("#phoneLink").href = `tel:${STORE.phone}`;
$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
