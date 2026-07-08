const STORE_KEY = "bobro_shop_data_v2";

const defaultData = {
  settings: {
    shopName: "BOBRO Shop",
    heroTitle: "Сучасний інтернет-магазин",
    heroText: "Каталог, категорії, атрибути, кошик і швидке оформлення замовлення.",
    telegram: "YOUR_TELEGRAM_USERNAME",
    phone: "+421 900 000 000",
    email: "info@example.com",
    address: "Bratislava, Slovakia",
    instagram: "https://instagram.com/",
  },
  categories: ["Електроніка", "Аксесуари", "Подарунки"],
  products: [
    {id:1,name:"Смарт-годинник",category:"Електроніка",price:39,oldPrice:49,stock:12,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",attributes:{Колір:"Чорний",Гарантія:"12 міс",Доставка:"1-2 дні"},description:"Стильний смарт-годинник для щоденного використання."},
    {id:2,name:"Навушники Bluetooth",category:"Електроніка",price:25,oldPrice:35,stock:20,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",attributes:{Тип:"Bluetooth",Колір:"Білий",Доставка:"1-2 дні"},description:"Безпровідні навушники з чистим звуком."},
    {id:3,name:"Power Bank",category:"Аксесуари",price:19,oldPrice:0,stock:9,image:"https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=700",attributes:{Ємність:"10000 mAh",Колір:"Сірий",USB:"Type-C"},description:"Компактний павербанк для телефону."},
    {id:4,name:"Зарядний кабель",category:"Аксесуари",price:7,oldPrice:0,stock:50,image:"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700",attributes:{Довжина:"1 м",Тип:"Type-C",Колір:"Білий"},description:"Міцний кабель для зарядки."},
    {id:5,name:"Портативна колонка",category:"Подарунки",price:32,oldPrice:39,stock:7,image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700",attributes:{Потужність:"10W",Колір:"Чорний",Bluetooth:"Так"},description:"Гучна колонка для дому і відпочинку."}
  ]
};

let selectedCategory = "Усі";
let cart = JSON.parse(localStorage.getItem("bobro_cart") || "[]");

function loadData(){
  const saved = localStorage.getItem(STORE_KEY);
  if(!saved){ localStorage.setItem(STORE_KEY, JSON.stringify(defaultData)); return structuredClone(defaultData); }
  try { return JSON.parse(saved); } catch { return structuredClone(defaultData); }
}
function saveData(data){ localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
function money(n){ return Number(n || 0).toFixed(2).replace(".00",""); }

function applySettings(){
  const data = loadData(); const s = data.settings;
  const setText = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
  setText("shopName",s.shopName); setText("footerShopName",s.shopName); setText("heroTitle",s.heroTitle); setText("heroText",s.heroText); setText("contactAddress",s.address);
  const phone=document.getElementById("contactPhone"); if(phone){ phone.textContent=s.phone; phone.href=`tel:${s.phone}`; }
  const email=document.getElementById("contactEmail"); if(email){ email.textContent=s.email; email.href=`mailto:${s.email}`; }
  const tg=document.getElementById("contactTelegram"); if(tg){ tg.textContent="Telegram"; tg.href=`https://t.me/${s.telegram.replace('@','')}`; }
  const ig=document.getElementById("contactInstagram"); if(ig){ ig.href=s.instagram || "#"; }
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
  const filtered=data.products.filter(p=>{
    const text=`${p.name} ${p.category} ${p.description} ${Object.values(p.attributes||{}).join(' ')}`.toLowerCase();
    return text.includes(search) && (selectedCategory==="Усі" || p.category===selectedCategory);
  });
  if(!filtered.length){ container.innerHTML=`<p>Товар не знайдено.</p>`; return; }
  container.innerHTML=filtered.map(p=>`
    <article class="card">
      <img src="${p.image}" alt="${p.name}">
      <p class="cat">${p.category}</p>
      <h3>${p.name}</h3>
      <p>${p.description || ""}</p>
      <div class="attrs">${Object.entries(p.attributes||{}).map(([k,v])=>`<span class="attr">${k}: ${v}</span>`).join("")}</div>
      <div class="price">${money(p.price)} € ${p.oldPrice ? `<small><s>${money(p.oldPrice)} €</s></small>` : ""}</div>
      <div class="stock">На складі: ${p.stock || 0}</div>
      <button onclick="addToCart(${p.id})">Додати в кошик</button>
    </article>`).join("");
}

function addToCart(id){
  const product=loadData().products.find(item=>item.id===id); if(!product) return;
  const existing=cart.find(item=>item.id===id);
  if(existing) existing.quantity += 1; else cart.push({...product, quantity:1});
  localStorage.setItem("bobro_cart", JSON.stringify(cart)); updateCart();
}
function updateCart(){
  const totalQuantity=cart.reduce((sum,item)=>sum+item.quantity,0); const count=document.getElementById("cartCount"); if(count) count.textContent=totalQuantity;
  const cartItems=document.getElementById("cartItems"); if(!cartItems) return; cartItems.innerHTML=""; let total=0;
  if(!cart.length) cartItems.innerHTML=`<p>Кошик порожній.</p>`;
  cart.forEach((item,index)=>{ total += item.price*item.quantity; cartItems.innerHTML += `<div class="cart-item"><span>${item.name} × ${item.quantity}</span><span>${money(item.price*item.quantity)} € <button onclick="removeItem(${index})">❌</button></span></div>`; });
  document.getElementById("totalPrice").textContent=money(total);
}
function removeItem(index){ cart.splice(index,1); localStorage.setItem("bobro_cart", JSON.stringify(cart)); updateCart(); }
function toggleCart(){ const panel=document.getElementById("cartPanel"); panel.style.display=panel.style.display==="flex"?"none":"flex"; }
function sendOrder(){
  const data=loadData(); const s=data.settings; const name=document.getElementById("clientName").value.trim(); const phone=document.getElementById("clientPhone").value.trim(); const comment=document.getElementById("clientComment").value.trim();
  if(!cart.length) return alert("Кошик порожній"); if(!name || !phone) return alert("Введіть імʼя і телефон");
  const total=cart.reduce((sum,item)=>sum+item.price*item.quantity,0); let text=`Нове замовлення:\nІмʼя: ${name}\nТелефон: ${phone}\nКоментар: ${comment || "-"}\n\nТовари:\n`;
  cart.forEach(item=> text += `- ${item.name} × ${item.quantity} — ${money(item.price*item.quantity)} €\n`); text += `\nРазом: ${money(total)} €`;
  if(!s.telegram || s.telegram==="YOUR_TELEGRAM_USERNAME") return alert("В адмін-панелі вкажіть Telegram username.");
  window.open(`https://t.me/${s.telegram.replace('@','')}?text=${encodeURIComponent(text)}`,"_blank");
}

applySettings(); renderCategories(); renderProducts(); updateCart();