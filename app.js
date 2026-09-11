import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc,
  deleteDoc, onSnapshot, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const appFirebase = initializeApp(firebaseConfig);
const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

const products = [
  {id:1,name:"Samsung Galaxy S24 Ultra",price:149999,originalPrice:179999,discount:17,rating:4.8,reviews:342,image:"https://images.unsplash.com/photo-1776437594003-47f3041d43ed?w=700&h=700&fit=crop&auto=format",category:"Electronics",brand:"Samsung",inStock:true,isFeatured:true,description:"The Samsung Galaxy S24 Ultra redefines smartphone excellence with its titanium frame, advanced AI features, and powerful camera system.",specs:{Display:'6.8" QHD+ Dynamic AMOLED',Processor:"Snapdragon 8 Gen 3",RAM:"12GB",Storage:"256GB",Battery:"5000mAh",Camera:"200MP + 12MP + 50MP + 10MP"}},
  {id:2,name:"Apple iPhone 15 Pro",price:169999,originalPrice:189999,discount:11,rating:4.9,reviews:521,image:"https://images.unsplash.com/photo-1778577528570-2963c48fd5ac?w=700&h=700&fit=crop&auto=format",category:"Electronics",brand:"Apple",inStock:true,isFeatured:true,description:"iPhone 15 Pro with titanium design, A17 Pro chip, Action button and advanced camera system.",specs:{Display:'6.1" Super Retina XDR',Processor:"A17 Pro",RAM:"8GB",Storage:"256GB",Battery:"3274mAh",Camera:"48MP + 12MP + 12MP"}},
  {id:3,name:"Sony WH-1000XM5 Headphones",price:32999,originalPrice:45999,discount:28,rating:4.7,reviews:289,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&h=700&fit=crop&auto=format",category:"Electronics",brand:"Sony",inStock:true,description:"Industry-leading noise canceling with 30-hour battery life and quick charging.",specs:{Driver:"30mm",Frequency:"4Hz-40,000Hz",Battery:"30 hours",Charging:"USB-C",Weight:"250g",Connectivity:"Bluetooth 5.2"}},
  {id:4,name:"Nike Air Max 270",price:14999,originalPrice:19999,discount:25,rating:4.5,reviews:167,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&h=700&fit=crop&auto=format",category:"Fashion",brand:"Nike",inStock:true,description:"The Nike Air Max 270 delivers all-day comfort with its large Air unit and modern design.",specs:{Upper:"Mesh + synthetic",Sole:"Rubber",Closure:"Lace-up",Color:"Black/White",Weight:"309g","Available Sizes":"6-12"}},
  {id:5,name:"Dell XPS 15 Laptop",price:189999,originalPrice:219999,discount:14,rating:4.6,reviews:98,image:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=700&h=700&fit=crop&auto=format",category:"Electronics",brand:"Dell",inStock:true,isFeatured:true,description:"The Dell XPS 15 combines stunning visuals with powerful performance in a premium aluminum chassis.",specs:{Display:'15.6" OLED 3.5K',Processor:"Intel Core i7-13700H",RAM:"16GB DDR5",Storage:"512GB NVMe SSD",GPU:"NVIDIA RTX 4060",Battery:"86Whr"}},
  {id:6,name:"Levi's 511 Slim Fit Jeans",price:4999,originalPrice:7999,discount:38,rating:4.3,reviews:445,image:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=700&h=700&fit=crop&auto=format",category:"Fashion",brand:"Levi's",inStock:true,description:"The 511 is a slim fit jean that sits below the waist and is slim through hip and thigh.",specs:{Material:"99% Cotton, 1% Elastane",Fit:"Slim",Rise:"Mid Rise","Leg Opening":'14.5"',Sizes:"28-38",Care:"Machine washable"}},
  {id:7,name:"boAt Airdopes 141",price:1299,originalPrice:2999,discount:57,rating:4.1,reviews:8921,image:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&h=700&fit=crop&auto=format",category:"Electronics",brand:"boAt",inStock:true,isNew:true,description:"TWS earbuds with 42H playtime, ENx technology and ASAP Charge.",specs:{Driver:"8mm",Battery:"42 hours total","Charge Time":"1.5 hours",Connectivity:"Bluetooth 5.1","Water Resistant":"IPX4",Weight:"4.9g per bud"}},
  {id:8,name:"Milton Thermosteel Flip Lid Flask",price:699,originalPrice:1299,discount:46,rating:4.4,reviews:2341,image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&h=700&fit=crop&auto=format",category:"Home & Kitchen",brand:"Milton",inStock:true,description:"Keep beverages hot for 12 hours and cold for 24 hours with this stainless steel flask.",specs:{Capacity:"1 Litre",Material:"Stainless Steel","Hot Duration":"12 hours","Cold Duration":"24 hours",Color:"Silver","BPA Free":"Yes"}}
];
const categories = [
  ["Electronics","💻",4892],["Fashion","👗",12847],["Home & Kitchen","🏠",8234],["Sports","⚽",3421],
  ["Beauty","💄",5678],["Books","📚",2934],["Toys","🧸",1823],["Grocery","🛒",6723]
];
const state = {
  page:"home", data:null, user:null, cart:[], wishlist:[],
  search:"", filterCategory:"All", sort:"featured", loading:false
};
let unsubCart=null, unsubWishlist=null;

const money = n => `रु ${Number(n||0).toLocaleString("en-IN")}`;
const esc = s => String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const getProduct = id => products.find(p=>p.id===Number(id));
const cartCount = () => state.cart.reduce((a,i)=>a+i.quantity,0);
const cartTotal = () => state.cart.reduce((a,i)=>a+i.product.price*i.quantity,0);
const nav = (page,data=null) => { state.page=page; state.data=data; window.scrollTo({top:0,behavior:"smooth"}); render(); };
const toast = (message,type="success") => {
  const el=document.createElement("div"); el.className=`toast ${type}`; el.textContent=message;
  document.querySelector("#toast-container").appendChild(el); setTimeout(()=>el.remove(),3000);
};

function productCard(p, compact=false){
  const wished=state.wishlist.includes(p.id);
  return `<article class="product-card" data-action="product" data-id="${p.id}">
    <div class="product-image">
      <img src="${p.image}" alt="${esc(p.name)}" loading="lazy">
      <div class="badges">${p.discount?`<span class="badge sale">-${p.discount}%</span>`:""}${p.isNew?`<span class="badge new">NEW</span>`:""}${!p.inStock?`<span class="badge out">OUT OF STOCK</span>`:""}</div>
      <button class="wish-btn ${wished?"active":""}" data-action="wish" data-id="${p.id}" aria-label="Wishlist">${wished?"♥":"♡"}</button>
    </div>
    <div class="product-info">
      <div class="brand">${esc(p.brand)}</div>
      <h3>${esc(p.name)}</h3>
      <div class="rating"><span>${"★".repeat(Math.round(p.rating))}${"☆".repeat(5-Math.round(p.rating))}</span> <small>(${p.reviews.toLocaleString()})</small></div>
      <div class="price-row"><strong>${money(p.price)}</strong>${p.discount?`<del>${money(p.originalPrice)}</del>`:""}</div>
      ${compact?"":`<button class="btn primary full" data-action="add" data-id="${p.id}" ${!p.inStock?"disabled":""}>${p.inStock?"Add to Cart":"Out of Stock"}</button>`}
    </div>
  </article>`;
}

function layout(content, opts={}){
  const hideHeader=opts.hideHeader;
  return `${hideHeader?"":header()}<main class="page">${content}</main>${hideHeader?"":footer()}${mobileNav()}`;
}

function header(){
 return `<div class="topbar"><div>🚚 Free delivery on orders above रु 999</div><div class="toplinks"><button data-page="help">Help Center</button><span>|</span><button data-page="my-orders">Track Order</button></div></div>
 <header class="navbar"><div class="nav-inner">
  <button class="logo" data-page="home"><span class="logo-mark">C</span><span>Click<span>Cart</span></span></button>
  <form id="nav-search" class="nav-search"><input id="global-search" value="${esc(state.search)}" placeholder="Search for products, brands and more..."><button>🔍</button></form>
  <div class="nav-actions">
   <button class="icon-btn mobile-only" data-action="toggle-search">🔍</button>
   <button class="icon-btn" data-page="wishlist">♡<i>${state.wishlist.length||""}</i></button>
   <button class="icon-btn" data-page="cart">🛒<i>${cartCount()||""}</i></button>
   <button class="account" data-page="${state.user?"profile":"login"}"><span>👤</span><b>${state.user?esc(state.user.displayName||"Account"):"Login"}</b></button>
   <button class="admin-link" data-page="admin">Admin</button>
   <button class="hamburger" data-action="toggle-menu">☰</button>
  </div>
 </div>
 <div id="mobile-search" class="mobile-search hidden"><form id="mobile-search-form"><input value="${esc(state.search)}" placeholder="Search products..."><button>🔍</button></form></div>
 <nav class="category-nav">${categories.map(c=>`<button data-category="${esc(c[0])}">${c[0]}</button>`).join("")}<button class="flash" data-page="shop">🔥 Flash Sale</button></nav>
 <div id="mobile-menu" class="mobile-menu hidden">${["Home","Shop",state.user?"Profile":"Login","My Orders","Wishlist","Notifications","Help Center","Admin Dashboard"].map(x=>`<button data-mobile="${esc(x)}">${esc(x)}</button>`).join("")}</div>
 </header>`;
}
function footer(){
 return `<footer><div class="footer-grid"><div><div class="footer-logo">Click<span>Cart</span></div><p>Your trusted destination for electronics, fashion and everyday essentials.</p></div><div><h4>Shop</h4><button data-page="shop">All Products</button><button data-category="Electronics">Electronics</button><button data-category="Fashion">Fashion</button></div><div><h4>Help</h4><button data-page="help">Help Center</button><button data-page="my-orders">Track Order</button><button data-page="profile">My Account</button></div><div><h4>Contact</h4><p>📧 support@clickcart.com</p><p>📞 +977 9800000000</p><p>📍 Kathmandu, Nepal</p></div></div><div class="footer-bottom">© ${new Date().getFullYear()} ClickCart. All rights reserved.</div></footer>`;
}
function mobileNav(){ return `<div class="mobile-nav"><button data-page="home">⌂<span>Home</span></button><button data-page="shop">▦<span>Shop</span></button><button data-page="cart">🛒<span>Cart</span><b>${cartCount()||""}</b></button><button data-page="${state.user?"profile":"login"}">👤<span>${state.user?"Account":"Login"}</span></button></div>`; }

function home(){
 const featured=products.filter(p=>p.isFeatured);
 return `<section class="hero"><div><div class="eyebrow">WELCOME TO CLICKCART</div><h1>Shop smarter.<br><span>Live better.</span></h1><p>Discover quality products at great prices, with fast delivery across Nepal.</p><div class="hero-actions"><button class="btn primary" data-page="shop">Shop Now →</button><button class="btn ghost" data-category="Electronics">Explore Electronics</button></div></div><div class="hero-card"><div class="hero-discount">UP TO<br><strong>57%</strong><br>OFF</div><div><div class="hero-product">🎧</div><b>Flash Sale</b><small>Limited time offers</small></div></div></section>
 <section class="section"><div class="section-head"><div><span class="section-kicker">BROWSE</span><h2>Shop by Category</h2></div><button class="link-btn" data-page="shop">View All →</button></div><div class="category-grid">${categories.map(c=>`<button class="category-card" data-category="${esc(c[0])}"><span class="cat-icon">${c[1]}</span><b>${esc(c[0])}</b><small>${c[2].toLocaleString()}+ products</small></button>`).join("")}</div></section>
 <section class="section tinted"><div class="section-head"><div><span class="section-kicker">TOP PICKS</span><h2>Featured Products</h2></div><button class="link-btn" data-page="shop">View All →</button></div><div class="product-grid">${featured.map(p=>productCard(p)).join("")}</div></section>
 <section class="section"><div class="promo-grid"><div class="promo"><span>🎁</span><div><h3>Free Delivery</h3><p>On orders above रु 999</p></div></div><div class="promo"><span>🔒</span><div><h3>Secure Payments</h3><p>100% safe & trusted checkout</p></div></div><div class="promo"><span>↩️</span><div><h3>Easy Returns</h3><p>7-day hassle-free returns</p></div></div><div class="promo"><span>💬</span><div><h3>24/7 Support</h3><p>We're here when you need us</p></div></div></div></section>`;
}
function shop(){
 let arr=[...products];
 if(state.filterCategory!=="All") arr=arr.filter(p=>p.category===state.filterCategory);
 if(state.sort==="price-low") arr.sort((a,b)=>a.price-b.price);
 if(state.sort==="price-high") arr.sort((a,b)=>b.price-a.price);
 if(state.sort==="rating") arr.sort((a,b)=>b.rating-a.rating);
 return `<div class="container"><div class="breadcrumb">Home / <b>Shop</b></div><div class="shop-head"><div><h1>Shop</h1><p>${arr.length} products</p></div><select id="sort-select"><option value="featured">Featured</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Top Rated</option></select></div><div class="shop-layout"><aside class="filters"><h3>Filters</h3><label>Category</label><button class="${state.filterCategory==="All"?"selected":""}" data-category="All">All Categories</button>${categories.map(c=>`<button class="${state.filterCategory===c[0]?"selected":""}" data-category="${esc(c[0])}">${esc(c[0])}</button>`).join("")}<label>Brand</label>${["Samsung","Apple","Sony","Nike","Dell","Levi's","boAt","Milton"].map(b=>`<button data-brand="${esc(b)}">${esc(b)}</button>`).join("")}</aside><div class="product-grid shop-products">${arr.map(p=>productCard(p)).join("")}</div></div></div>`;
}
function searchPage(){
 const q=state.search.trim().toLowerCase();
 const results=products.filter(p=>p.name.toLowerCase().includes(q)||p.brand.toLowerCase().includes(q)||p.category.toLowerCase().includes(q));
 return `<div class="container narrow"><div class="search-large"><input id="search-page-input" value="${esc(state.search)}" placeholder="Search products, brands..."><button data-action="page-search">🔍 Search</button></div><h2>${q?`${results.length} results for "${esc(state.search)}"`:"Trending Searches"}</h2>${q?`<div class="product-grid">${results.map(p=>productCard(p)).join("")||`<div class="empty full-span"><div>🔍</div><h3>No products found</h3><p>Try a different keyword.</p></div>`}</div>`:`<div class="chips">${["Samsung Galaxy","Nike Shoes","iPhone 15","Dell Laptop","Sony Headphones","boAt Earbuds"].map(x=>`<button data-search="${x}">${x}</button>`).join("")}</div><h2>Popular Categories</h2><div class="category-grid small">${categories.slice(0,4).map(c=>`<button class="category-card" data-category="${esc(c[0])}">${c[1]} <b>${esc(c[0])}</b></button>`).join("")}</div>`}</div>`;
}
function productDetail(){
 const p=state.data||products[0];
 return `<div class="container"><div class="breadcrumb">Home / ${esc(p.category)} / <b>${esc(p.name)}</b></div><div class="detail"><div class="detail-image"><img src="${p.image}" alt="${esc(p.name)}"></div><div class="detail-info"><div class="brand">${esc(p.brand)}</div><h1>${esc(p.name)}</h1><div class="rating big">★ ${p.rating} <span>(${p.reviews.toLocaleString()} reviews)</span></div><div class="detail-price">${money(p.price)} <del>${money(p.originalPrice)}</del> <span>-${p.discount}%</span></div><p>${esc(p.description)}</p><div class="stock">${p.inStock?"✓ In Stock":"Out of Stock"}</div><div class="qty"><button data-action="qty-minus">−</button><b id="detail-qty">1</b><button data-action="qty-plus">+</button></div><div class="detail-actions"><button class="btn primary" data-action="add-detail" data-id="${p.id}" ${!p.inStock?"disabled":""}>🛒 Add to Cart</button><button class="btn outline" data-action="wish" data-id="${p.id}">♡ Wishlist</button></div></div></div><section class="spec-section"><h2>Specifications</h2><div class="spec-grid">${Object.entries(p.specs||{}).map(([k,v])=>`<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div></section><section class="section"><h2>Related Products</h2><div class="product-grid">${products.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4).map(x=>productCard(x)).join("")}</div></section></div>`;
}
function cartPage(){
 return `<div class="container"><div class="breadcrumb">Home / <b>Cart</b></div><h1>Shopping Cart</h1>${!state.cart.length?`<div class="empty"><div>🛒</div><h2>Your cart is empty</h2><p>Add products to your cart and they will appear here.</p><button class="btn primary" data-page="shop">Continue Shopping</button></div>`:`<div class="cart-layout"><div>${state.cart.map(i=>`<div class="cart-item"><img src="${i.product.image}"><div class="cart-item-info"><b>${esc(i.product.name)}</b><small>${esc(i.product.brand)}</small><strong>${money(i.product.price)}</strong><div class="qty"><button data-action="cart-minus" data-id="${i.product.id}">−</button><b>${i.quantity}</b><button data-action="cart-plus" data-id="${i.product.id}">+</button></div></div><button class="remove" data-action="remove-cart" data-id="${i.product.id}">Remove</button></div>`).join("")}</div><aside class="summary"><h3>Order Summary</h3><div><span>Subtotal</span><b>${money(cartTotal())}</b></div><div><span>Delivery</span><b>${cartTotal()>=999?"FREE":money(100)}</b></div><hr><div class="total"><span>Total</span><b>${money(cartTotal()+(cartTotal()>=999?0:100))}</b></div><button class="btn primary full" data-page="${state.user?"checkout":"login"}">Proceed to Checkout</button><button class="btn outline full" data-page="shop">Continue Shopping</button></aside></div>`}</div>`;
}
function wishlistPage(){
 const items=products.filter(p=>state.wishlist.includes(p.id));
 return `<div class="container"><div class="breadcrumb">Home / <b>Wishlist</b></div><div class="section-head"><div><h1>My Wishlist</h1><p>${items.length} saved item${items.length===1?"":"s"}</p></div></div>${items.length?`<div class="product-grid">${items.map(p=>productCard(p)).join("")}</div>`:`<div class="empty"><div>♡</div><h2>Your wishlist is empty</h2><p>Save products you love for later.</p><button class="btn primary" data-page="shop">Browse Products</button></div>`}</div>`;
}
function authPage(mode="login"){
 const signup=mode==="signup";
 return `<div class="auth-page"><div class="auth-card"><div class="auth-logo" data-page="home">C<span>ClickCart</span></div><h1>${signup?"Create your account":"Welcome back"}</h1><p>${signup?"Join ClickCart today.":"Sign in to continue shopping."}</p><form id="auth-form" data-mode="${signup?"signup":"login"}">${signup?`<label>Full name<input name="name" required placeholder="Your name"></label>`:""}<label>Email<input name="email" type="email" required placeholder="you@example.com"></label><label>Password<input name="password" type="password" required minlength="6" placeholder="••••••••"></label><button class="btn primary full">${signup?"Create Account":"Sign In"}</button></form><div class="auth-links">${signup?`Already have an account? <button data-page="login">Sign in</button>`:`Don't have an account? <button data-page="signup">Create one</button>`}</div></div></div>`;
}
function profilePage(){
 if(!state.user) return authPage();
 return `<div class="container narrow"><div class="profile-card"><div class="avatar">${esc((state.user.displayName||"U")[0]).toUpperCase()}</div><h1>${esc(state.user.displayName||"User")}</h1><p>${esc(state.user.email)}</p><div class="profile-menu"><button data-page="my-orders">📦 My Orders <span>→</span></button><button data-page="wishlist">♡ Wishlist <span>→</span></button><button data-page="notifications">🔔 Notifications <span>→</span></button><button data-action="logout">↪ Sign Out <span>→</span></button></div></div></div>`;
}
function checkoutPage(){
 if(!state.user) return authPage();
 const delivery=cartTotal()>=999?0:100, total=cartTotal()+delivery;
 return `<div class="container narrow"><div class="breadcrumb">Cart / <b>Checkout</b></div><h1>Checkout</h1><form id="checkout-form" class="checkout"><section class="panel"><h3>Delivery Address</h3><div class="form-grid"><label>Full name<input name="name" required value="${esc(state.user.displayName||"")}"></label><label>Phone<input name="phone" required placeholder="98XXXXXXXX"></label><label class="wide">Address<input name="address" required placeholder="Street, area"></label><label>City<input name="city" required value="Kathmandu"></label><label>Province<input name="province" required placeholder="Bagmati"></label></div></section><section class="panel"><h3>Payment Method</h3><label class="radio"><input type="radio" name="payment" value="Cash on Delivery" checked> Cash on Delivery</label><label class="radio"><input type="radio" name="payment" value="eSewa"> eSewa</label><label class="radio"><input type="radio" name="payment" value="Khalti"> Khalti</label></section><aside class="summary"><h3>Order Summary</h3>${state.cart.map(i=>`<div><span>${esc(i.product.name)} × ${i.quantity}</span><b>${money(i.product.price*i.quantity)}</b></div>`).join("")}<hr><div><span>Delivery</span><b>${delivery?money(delivery):"FREE"}</b></div><div class="total"><span>Total</span><b>${money(total)}</b></div><button class="btn primary full" type="submit">Place Order</button></aside></form></div>`;
}
function confirmationPage(){
 const order=state.data;
 return `<div class="confirmation"><div class="confirm-card"><div class="success-icon">✓</div><h1>Order Placed!</h1><p>Your order has been successfully placed. We'll deliver it soon.</p><div class="order-meta"><div><small>Order ID</small><b>#${esc(order?.id||"CC")}</b></div><div><small>Status</small><b class="green">Confirmed</b></div><div><small>Payment</small><b>${esc(order?.payment||"COD")}</b></div><div><small>Delivery</small><b>2–3 days</b></div></div><div class="timeline"><div class="done">✓ <span><b>Order Confirmed</b><small>We've received your order</small></span></div><div>📦 <span><b>Processing</b><small>Your items are being packed</small></span></div><div>🚚 <span><b>Dispatched</b><small>Out for delivery</small></span></div><div>🏠 <span><b>Delivered</b><small>Expected within 2–3 days</small></span></div></div><div class="two-buttons"><button class="btn primary" data-page="my-orders">Track Order</button><button class="btn outline" data-page="home">Continue Shopping</button></div></div></div>`;
}
function ordersPage(){
 if(!state.user) return authPage();
 return `<div class="container"><div class="breadcrumb">Home / <b>My Orders</b></div><h1>My Orders</h1><div id="orders-list" class="orders-list"><div class="loading">Loading orders…</div></div></div>`;
}
function notificationsPage(){
 return `<div class="container narrow"><div class="breadcrumb">Home / <b>Notifications</b></div><h1>Notifications</h1><div class="notice"><span>🎉</span><div><b>Welcome to ClickCart</b><p>Enjoy great deals and free delivery on orders above रु 999.</p></div></div><div class="notice"><span>🚚</span><div><b>Fast delivery</b><p>Most Kathmandu orders arrive within 2–3 days.</p></div></div></div>`;
}
function helpPage(){
 return `<div class="container narrow"><div class="breadcrumb">Home / <b>Help Center</b></div><h1>How can we help?</h1><div class="help-grid"><button><span>📦</span><b>Orders & Delivery</b><small>Track, cancel or manage orders</small></button><button><span>↩️</span><b>Returns & Refunds</b><small>Learn about our return policy</small></button><button><span>💳</span><b>Payments</b><small>Payment methods and issues</small></button><button><span>👤</span><b>Account</b><small>Manage your ClickCart account</small></button></div><div class="faq"><h2>Frequently Asked Questions</h2><details><summary>How long does delivery take?</summary><p>Typical delivery is 2–3 days in Kathmandu. Other locations may take longer.</p></details><details><summary>Is cash on delivery available?</summary><p>Yes. Cash on Delivery is available for eligible products and locations.</p></details><details><summary>How do I track my order?</summary><p>Sign in and open My Orders to see your latest order status.</p></details></div></div>`;
}
function adminPage(){
 return `<div class="container"><div class="admin-head"><div><span class="section-kicker">MANAGEMENT</span><h1>Admin Dashboard</h1><p>Monitor your ClickCart store.</p></div><button class="btn outline" data-page="home">Back to Store</button></div><div class="stats"><div><span>💰</span><b id="stat-sales">—</b><small>Total Sales</small></div><div><span>📦</span><b id="stat-orders">—</b><small>Orders</small></div><div><span>👥</span><b id="stat-users">—</b><small>Customers</small></div><div><span>🛍️</span><b>${products.length}</b><small>Products</small></div></div><div class="admin-grid"><section class="panel"><div class="section-head"><h2>Products</h2><button class="btn primary small" data-action="seed-products">Sync Products to Firebase</button></div><div class="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead><tbody>${products.map(p=>`<tr><td><div class="table-product"><img src="${p.image}"><span>${esc(p.name)}</span></div></td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td>${p.inStock?"In Stock":"Out"}</td></tr>`).join("")}</tbody></table></div></section><section class="panel"><h2>Traffic Sources</h2>${[["Organic Search",45],["Social Media",23],["Direct",19],["Referral",10],["Email",3]].map(x=>`<div class="bar-row"><span>${x[0]}</span><b>${x[1]}%</b><div><i style="width:${x[1]}%"></i></div></div>`).join("")}</section></div></div>`;
}

function render(){
 let content;
 switch(state.page){
  case "home": content=home(); break; case "shop": content=shop(); break; case "search": content=searchPage(); break;
  case "product": content=productDetail(); break; case "cart": content=cartPage(); break; case "wishlist": content=wishlistPage();
  case "login": content=authPage("login"); break; case "signup": content=authPage("signup"); break; case "profile": content=profilePage();
  case "checkout": content=checkoutPage(); break; case "order-confirmation": content=confirmationPage(); break; case "my-orders": content=ordersPage();
  case "notifications": content=notificationsPage(); break; case "help": content=helpPage(); break; case "admin": content=adminPage(); break;
  default: content=`<div class="empty"><div>404</div><h2>Page not found</h2><button class="btn primary" data-page="home">Go Home</button></div>`;
 }
 document.querySelector("#app").innerHTML=layout(content,{hideHeader:["login","signup","checkout","order-confirmation","admin"].includes(state.page)});
 if(state.page==="my-orders" && state.user) loadOrders();
 if(state.page==="admin") loadAdminStats();
}

async function loadUserData(user){
 if(unsubCart) unsubCart(); if(unsubWishlist) unsubWishlist();
 const cartRef=doc(db,"users",user.uid,"private","cart");
 const wishRef=doc(db,"users",user.uid,"private","wishlist");
 unsubCart=onSnapshot(cartRef,s=>{
   state.cart=(s.exists()?s.data().items:[]).map(i=>({product:getProduct(i.productId)||i.product,quantity:i.quantity}));
   if(["cart","checkout","home","shop","product","wishlist"].includes(state.page)) render();
 },()=>{});
 unsubWishlist=onSnapshot(wishRef,s=>{
   state.wishlist=s.exists()?(s.data().ids||[]):[];
   if(["wishlist","home","shop","product"].includes(state.page)) render();
 },()=>{});
}
async function saveCart(){
 if(!state.user) return;
 await setDoc(doc(db,"users",state.user.uid,"private","cart"),{items:state.cart.map(i=>({productId:i.product.id,quantity:i.quantity,product:i.product})),updatedAt:serverTimestamp()});
}
async function saveWishlist(){
 if(!state.user) return;
 await setDoc(doc(db,"users",state.user.uid,"private","wishlist"),{ids:state.wishlist,updatedAt:serverTimestamp()});
}
async function addCart(id,qty=1){
 const p=getProduct(id); if(!p?.inStock) return toast("Product is out of stock","error");
 const existing=state.cart.find(i=>i.product.id===p.id);
 if(existing) existing.quantity+=qty; else state.cart.push({product:p,quantity:qty});
 await saveCart(); toast(`${p.name} added to cart!`); render();
}
async function toggleWish(id){
 state.wishlist=state.wishlist.includes(Number(id))?state.wishlist.filter(x=>x!==Number(id)):[...state.wishlist,Number(id)];
 await saveWishlist(); toast(state.wishlist.includes(Number(id))?"Added to wishlist!":"Removed from wishlist","info"); render();
}

async function loadOrders(){
 const box=document.querySelector("#orders-list"); if(!box)return;
 try{
  const snap=await getDocsCompat();
  const orders=snap;
  box.innerHTML=orders.length?orders.map(o=>`<div class="order-card"><div><small>Order #${esc(o.id)}</small><h3>${money(o.total)}</h3><p>${new Date(o.createdAt?.seconds?o.createdAt.seconds*1000:o.createdAt||Date.now()).toLocaleString()}</p></div><div><b class="status">${esc(o.status||"Confirmed")}</b><p>${o.items?.length||0} item(s) · ${esc(o.payment||"COD")}</p></div></div>`).join(""):`<div class="empty"><div>📦</div><h2>No orders yet</h2><button class="btn primary" data-page="shop">Start Shopping</button></div>`;
 }catch(e){box.innerHTML=`<div class="empty"><p>Could not load orders. Check Firebase configuration.</p></div>`;}
}
async function getDocsCompat(){
 const {getDocs}=await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
 const qy=query(collection(db,"orders"),where("userId","==",state.user.uid));
 const snap=await getDocs(qy); return snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
}
async function loadAdminStats(){
 try{
  const {getDocs}=await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
  const snap=await getDocs(collection(db,"orders"));
  let sales=0; snap.forEach(d=>sales+=Number(d.data().total||0));
  document.querySelector("#stat-sales").textContent=money(sales);
  document.querySelector("#stat-orders").textContent=snap.size;
 }catch(e){
  document.querySelector("#stat-sales").textContent="Firebase";
  document.querySelector("#stat-orders").textContent="Not connected";
 }
}
async function seedProducts(){
 const {writeBatch}=await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js");
 const batch=writeBatch(db);
 products.forEach(p=>batch.set(doc(db,"products",String(p.id)),p));
 await batch.commit(); toast("Products synced to Firebase");
}

document.addEventListener("click",async e=>{
 const t=e.target.closest("[data-page],[data-action],[data-category],[data-search],[data-brand],[data-mobile]");
 if(!t)return;
 if(t.dataset.page){nav(t.dataset.page);return;}
 if(t.dataset.category){state.filterCategory=t.dataset.category; nav("shop");return;}
 if(t.dataset.search){state.search=t.dataset.search;nav("search");return;}
 if(t.dataset.brand){state.filterBrand=t.dataset.brand;nav("shop");return;}
 const a=t.dataset.action, id=t.dataset.id;
 try{
  if(a==="product") nav("product",getProduct(id));
  else if(a==="add") await addCart(id);
  else if(a==="add-detail") await addCart(id,Number(document.querySelector("#detail-qty")?.textContent||1));
  else if(a==="wish") await toggleWish(id);
  else if(a==="remove-cart"){state.cart=state.cart.filter(i=>i.product.id!==Number(id));await saveCart();render();}
  else if(a==="cart-plus"){const i=state.cart.find(x=>x.product.id===Number(id));if(i)i.quantity++;await saveCart();render();}
  else if(a==="cart-minus"){const i=state.cart.find(x=>x.product.id===Number(id));if(i)i.quantity--;state.cart=state.cart.filter(x=>x.quantity>0);await saveCart();render();}
  else if(a==="qty-plus"){const b=document.querySelector("#detail-qty");b.textContent=Number(b.textContent)+1;}
  else if(a==="qty-minus"){const b=document.querySelector("#detail-qty");b.textContent=Math.max(1,Number(b.textContent)-1);}
  else if(a==="toggle-search") document.querySelector("#mobile-search").classList.toggle("hidden");
  else if(a==="toggle-menu") document.querySelector("#mobile-menu").classList.toggle("hidden");
  else if(a==="logout"){await signOut(auth);nav("home");toast("Signed out","info");}
  else if(a==="page-search"){state.search=document.querySelector("#search-page-input").value;nav("search");}
  else if(a==="seed-products") await seedProducts();
 }catch(err){console.error(err);toast(err.message||"Something went wrong","error");}
});

document.addEventListener("click",e=>{
 const m=e.target.closest("[data-mobile]"); if(!m)return;
 const map={"Home":"home","Shop":"shop","Profile":"profile","Login":"login","My Orders":"my-orders","Wishlist":"wishlist","Notifications":"notifications","Help Center":"help","Admin Dashboard":"admin"};
 nav(map[m.dataset.mobile]||"home");
});

document.addEventListener("submit",async e=>{
 if(e.target.id==="nav-search"){e.preventDefault();state.search=document.querySelector("#global-search").value.trim();if(state.search)nav("search");}
 if(e.target.id==="mobile-search-form"){e.preventDefault();state.search=e.target.querySelector("input").value.trim();if(state.search)nav("search");}
 if(e.target.id==="auth-form"){
  e.preventDefault(); const f=new FormData(e.target), mode=e.target.dataset.mode;
  try{
   if(mode==="signup"){const c=await createUserWithEmailAndPassword(auth,f.get("email"),f.get("password"));await updateProfile(c.user,{displayName:f.get("name")});toast("Account created!");nav("home");}
   else {await signInWithEmailAndPassword(auth,f.get("email"),f.get("password"));toast("Welcome back!");nav("home");}
  }catch(err){toast(err.message.replace("Firebase: ",""),"error");}
 }
 if(e.target.id==="checkout-form"){
  e.preventDefault(); if(!state.cart.length)return toast("Your cart is empty","error");
  const f=new FormData(e.target), delivery=cartTotal()>=999?0:100,total=cartTotal()+delivery;
  try{
   const ref=await addDoc(collection(db,"orders"),{userId:state.user.uid,customer:{name:f.get("name"),phone:f.get("phone"),address:f.get("address"),city:f.get("city"),province:f.get("province")},items:state.cart.map(i=>({productId:i.product.id,name:i.product.name,price:i.product.price,quantity:i.quantity,image:i.product.image})),subtotal:cartTotal(),delivery,total,payment:f.get("payment"),status:"Confirmed",createdAt:serverTimestamp()});
   state.cart=[];await saveCart();nav("order-confirmation",{id:ref.id,total,payment:f.get("payment")});toast("Order placed successfully!");
  }catch(err){toast("Could not place order. Check Firebase.","error");console.error(err);}
 }
});
document.addEventListener("change",e=>{if(e.target.id==="sort-select"){state.sort=e.target.value;render();}});
document.addEventListener("input",e=>{if(e.target.id==="global-search")state.search=e.target.value;});

onAuthStateChanged(auth,user=>{
 state.user=user;
 if(user) loadUserData(user); else {state.cart=[];state.wishlist=[];}
 render();
});
render();
