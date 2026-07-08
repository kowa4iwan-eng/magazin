const STORE_KEY = "bobro_shop_data_v3";
const CART_KEY = "bobro_cart_v3";
const CURRENCY_KEY = "bobro_currency";

const rates = {
  UAH: { symbol: "₴", rate: 1 },
  USD: { symbol: "$", rate: 0.024 },
  EUR: { symbol: "€", rate: 0.022 }
};

const defaultData = {
  settings: {
    shopName: "BOBRO Shop",
    heroTitle: "Сучасний інтернет-магазин",
    heroText: "Каталог, категорії, атрибути, кошик і швидке оформлення замовлення.",
    telegram: "YOUR_TELEGRAM_USERNAME",
    phone: "+421 900 000 000",
    email: "info@example.com",
    address: "Bratislava, Slovakia",
    instagram: "https://instagram.com/"
  },
  categories: ["Електроніка", "Аксесуари", "Подарунки"],
  products: [
    {id:1,name:"Смарт-годинник",category:"Електроніка",price:1599,oldPrice:1999,stock:12,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",attributes:{Колір:"Чорний",Гарантія:"12 міс",Доставка:"1-2 дні"},description:"Стильний смарт-годинник для щоденного використання."},
    {id:2,name:"Навушники Bluetooth",category:"Електроніка",price:999,oldPrice:1399,stock:20,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",attributes:{Тип:"Bluetooth",Колір:"Білий",Доставка:"1-2 дні"},description:"Безпровідні навушники з чистим звуком."},
    {id:3,name:"Power Bank",category:"Аксесуари",price:799,oldPrice:0,stock:9,image:"https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=700",attributes:{Ємність:"10000 mAh",Колір:"Сірий",USB:"Type-C"},description:"Компактний павербанк для телефону."},
    {id:4,name:"Зарядний кабель",category:"Аксесуари",price:299,oldPrice:0,stock:50,image:"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700",attributes:{Довжина:"1 м",Тип:"Type-C",Колір:"Білий"},description:"Міцний кабель для зарядки."},
    {id:5,name:"Портативна колонка",category:"Подарунки",price:1299,oldPrice:1599,stock:7,image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700",attributes:{Потужність:"10W",Колір:"Чорний",Bluetooth:"Так"},description:"Гучна колонка для дому і відпочинку."}
  ]
};

let selectedCategory = "Усі";
let currentCurrency = localStorage.getItem(CURRENCY_KEY) || "UAH";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

function loadData(){
  const saved = localStorage.getItem(STORE_KEY);
  if(!saved){ localStorage.setItem(STORE_KEY, JSON.stringify(defaultData)); return structuredClone(defaultData); }
  try { return JSON.parse(saved); } catch { return structuredClone(defaultData); }
}
function saveData(data){ localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
function convertPrice(price){ return Number(price || 0) * rates[currentCurrency].rate; }
function formatPrice(priceUAH){
  const value = convertPrice(priceUAH);
  const rounded = currentCurrency === "UAH" ? Math.round(value) : value.toFixed(2);
  return `${rounded} ${rates[currentCurrency].symbol}`;
}
function setCurrency(currency){
  currentCurrency = currency;
  localStorage.setItem(CURRENCY_KEY, currency);
  renderProducts();
  updateCart();
}

function applySettings(){
  const data = loadData(); const s = data.settings;
  const setText = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
  setText("shopName",s.shopName); setText("footerShopName",s.shopName); setText("heroTitle",s.heroTitle); setText("heroText",s.heroText); setText("contactAddress",s.address);
  const phone=document.getElementById("contactPhone"); if(phone){ phone.textContent=s.phone; phone.href=`tel:${s.phone}`; }
  const email=document.getElementById("contactEmail"); if(email){ email.textContent=s.email; email.href=`mailto:${s.email}`; }
  const tg=document.getElementById("contactTelegram"); if(tg){ tg.textContent="Telegram"; tg.href=`https://t.me/${s.telegram.replace('@','')}`; }
  const ig=document.getElementById("contactInstagram"); if(ig){ ig.href=s.instagram || "#"; }
  const currencySelect=document.getElementById("currencySelect"); if(currencySelect) currencySelect.value=currentCurrency;
}

function renderCategories(){
  const data=loadData(); const wrap=document.getElementById("categoryFilters"); if(!wrap) return;
  const cats=["Усі",...data.categories];
  wrap.innerHTML=cats.map(cat=>`<button class="filter-btn ${cat===selectedCategory?'active':''}" onclick="selectCategory('${cat.replace(/'/g,"\\'")}')">${cat}</button>`).join("");
}
function selectCategory(cat){ selectedCategory=cat; renderCategories(); renderProducts(); }

function renderProducts(){
  const data=loadData(); const container=document.getElementById("products"); if(!container) return;
  const search=(document.getElementById("searchInput")?.value || "").toLowerCase();
  const maxPrice=Number(document.getElementById("maxPriceInput")?.value || 0);
  const stockOnly=document.getElementById("stockOnlyInput")?.checked || false;
  const sort=document.getElementById("sortSelect")?.value || "default";
  let filtered=data.products.filter(p=>{
    const text=`${p.name} ${p.category} ${p.description} ${Object.values(p.attributes||{}).join(' ')}`.toLowerCase();
    const bySearch=text.includes(search);
    const byCategory=selectedCategory==="Усі" || p.category===selectedCategory;
    const byPrice=!maxPrice || Number(p.price || 0) <= maxPrice;
    const byStock=!stockOnly || Number(p.stock || 0) > 0;
    return bySearch && byCategory && byPrice && byStock;
  });
  if(sort==="cheap") filtered.sort((a,b)=>a.price-b.price);
  if(sort==="expensive") filtered.sort((a,b)=>b.price-a.price);
  if(sort==="name") filtered.sort((a,b)=>a.name.localeCompare(b.name,"uk"));
  if(!filtered.length){ container.innerHTML=`<p>Товар не знайдено.</p>`; return; }
  container.innerHTML=filtered.map(p=>`
    <article class="card">
      <img src="${p.image || 'https://via.placeholder.com/700x450?text=No+Image'}" alt="${p.name}">
      <p class="cat">${p.category}</p>
      <h3>${p.name}</h3>
      <p>${p.description || ""}</p>
      <div class="attrs">${Object.entries(p.attributes||{}).map(([k,v])=>`<span class="attr">${k}: ${v}</span>`).join("")}</div>
      <div class="price">${formatPrice(p.price)} ${p.oldPrice ? `<small><s>${formatPrice(p.oldPrice)}</s></small>` : ""}</div>
      <div class="stock">${Number(p.stock || 0) > 0 ? `На складі: ${p.stock}` : 'Немає в наявності'}</div>
      <button onclick="addToCart(${p.id})" ${Number(p.stock || 0) <= 0 ? 'disabled' : ''}>Додати в кошик</button>
    </article>`).join("");
}

function addToCart(id){
  const product=loadData().products.find(item=>item.id===id); if(!product) return;
  const existing=cart.find(item=>item.id===id);
  if(existing) existing.quantity += 1; else cart.push({id:product.id, quantity:1});
  localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCart();
}
function updateCart(){
  const data=loadData();
  const totalQuantity=cart.reduce((sum,item)=>sum+item.quantity,0); const count=document.getElementById("cartCount"); if(count) count.textContent=totalQuantity;
  const cartItems=document.getElementById("cartItems"); if(!cartItems) return; cartItems.innerHTML=""; let total=0;
  if(!cart.length) cartItems.innerHTML=`<p>Кошик порожній.</p>`;
  cart.forEach((cartItem,index)=>{
    const item=data.products.find(p=>p.id===cartItem.id) || cartItem;
    total += Number(item.price || 0)*cartItem.quantity;
    cartItems.innerHTML += `<div class="cart-item"><span>${item.name} × ${cartItem.quantity}</span><span>${formatPrice(Number(item.price || 0)*cartItem.quantity)} <button onclick="removeItem(${index})">❌</button></span></div>`;
  });
  document.getElementById("totalPrice").textContent=formatPrice(total);
}
function removeItem(index){ cart.splice(index,1); localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCart(); }
function toggleCart(){ const panel=document.getElementById("cartPanel"); panel.style.display=panel.style.display==="flex"?"none":"flex"; }
function sendOrder(){
  const data=loadData(); const s=data.settings; const name=document.getElementById("clientName").value.trim(); const phone=document.getElementById("clientPhone").value.trim(); const comment=document.getElementById("clientComment").value.trim();
  if(!cart.length) return alert("Кошик порожній"); if(!name || !phone) return alert("Введіть імʼя і телефон");
  let total=0; let text=`Нове замовлення:\nІмʼя: ${name}\nТелефон: ${phone}\nВалюта: ${currentCurrency}\nКоментар: ${comment || "-"}\n\nТовари:\n`;
  cart.forEach(cartItem=>{ const item=data.products.find(p=>p.id===cartItem.id) || cartItem; const sum=Number(item.price || 0)*cartItem.quantity; total += sum; text += `- ${item.name} × ${cartItem.quantity} — ${formatPrice(sum)}\n`; });
  text += `\nРазом: ${formatPrice(total)}`;
  if(!s.telegram || s.telegram==="YOUR_TELEGRAM_USERNAME") return alert("В адмін-панелі вкажіть Telegram username.");
  window.open(`https://t.me/${s.telegram.replace('@','')}?text=${encodeURIComponent(text)}`,"_blank");
}

applySettings(); renderCategories(); renderProducts(); updateCart();