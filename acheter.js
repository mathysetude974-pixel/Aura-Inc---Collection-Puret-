// acheter.js — moved from inline script in acheter.html
// Product data and page logic for acheter.html
const products = [
  { id: 0, title: 'Édition Mimosa', model: '3d_model/canette_mimosa.glb', price: 99.00, desc: '', longDesc: `Édition Mimosa —\n\nCette édition incarne la recherche d'une expression florale pure : sélection des matières premières, extraction maîtrisée et montage olfactif pensé pour la transparence et la finesse. Notes de tête lumineuses s'ouvrent sur un coeur floral délicat, soutenu par une structure sèche et nette qui prolonge la lisibilité du parfum.` },
  { id: 1, title: 'Édition Violette', model: '3d_model/canette_violette.glb', price: 99.00, desc: 'Une profondeur florale maîtrisée.', longDesc: `Édition Violette — Une profondeur florale maîtrisée.\n\nRiche et nuancée, cette édition explore les facettes veloutées de la violette. Le profil se développe en couches progressives : végétal, poudré, puis résolument floral. Conçue pour l'observation attentive, la Violette offre une présence définie sans lourdeur.` },
  { id: 2, title: 'Édition Menthe', model: '3d_model/canette_menthe.glb', price: 99.00, desc: 'Un souffle d’une grande fraîcheur.', longDesc: `Édition Menthe — Un souffle d’une grande fraîcheur.\n\nFidèle à une fraîcheur maîtrisée, la Menthe propose une ouverture éclatante, suivie d'une tenue délicate qui met en valeur des accents verts et minéraux. Cette édition privilégie la netteté et la persistance d'un registre rafraîchissant, pensé pour l'observateur exigeant.` }
];

function q(sel){ return document.querySelector(sel); }
function getParam(name){ const params = new URLSearchParams(window.location.search); return params.get(name); }

document.addEventListener('DOMContentLoaded', () => {
  const idxParam = parseInt(getParam('idx'));
  const idx = (!isNaN(idxParam) && idxParam >= 0 && idxParam < products.length) ? idxParam : 0;
  const p = products[idx];

  // adjust nav links for special behavior
  if (idx === 1 || idx === 2) {
    const sel = `a[href="acheter.html?idx=${idx}"], a[href$="acheter.html?idx=${idx}"]`;
    document.querySelectorAll(sel).forEach(a => {
      try { a.textContent = 'Mimosa'; a.setAttribute('href', 'acheter.html?idx=0'); } catch(e){}
    });
  }

  // bind UI
  const modelViewer = q('#product-model');
  if (modelViewer && p.model) {
    modelViewer.setAttribute('src', p.model);
    modelViewer.setAttribute('alt', p.title + ' 3D');
  }

  q('#product-title').textContent = p.title;
  q('#product-desc').textContent = p.desc || '';
  const longDescEl = q('#product-long-desc'); if (longDescEl) longDescEl.textContent = (p.longDesc || p.desc).replace(/\n\n/g, '\n\n');
  q('#product-price').textContent = '€' + p.price.toFixed(2);

  // model viewer pointer feedback
  if (modelViewer) {
    modelViewer.addEventListener('pointerdown', () => { modelViewer.style.cursor = 'grabbing'; });
    document.addEventListener('pointerup', () => { modelViewer.style.cursor = 'grab'; });
    modelViewer.addEventListener('touchstart', () => {});
    modelViewer.addEventListener('touchend', () => {});
  }

  const qtyEl = q('#qty');
  const buyResult = q('#buy-result');
  function computeTotal() {
    let qty = parseInt(qtyEl.value) || 1; qty = Math.min(50, Math.max(1, qty)); try { qtyEl.value = qty; } catch(e){}
    const unit = p.price; const total = unit * qty; return { qty, unit, total };
  }
  qtyEl.addEventListener('input', () => { if(buyResult) buyResult.textContent = ''; computeTotal(); });

  // cart helpers
  const CART_KEY = 'aura_cart';
  function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
  function saveCart(cart){ try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e){} }
  function cartItemCount(){ return getCart().reduce((s,i)=>s+(i.qty||0),0); }
  function updateCartLinkCount(){ const badge = q('#cart-count'); if(!badge) return; const n = cartItemCount(); badge.textContent = n; badge.style.display = 'inline-flex'; }

  try { window.addEventListener('storage', (e) => { if (e.key === CART_KEY) updateCartLinkCount(); }); } catch(e) {}
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCartLinkCount(); });

  // in-page cart drawer (construct elements)
  (function(){
    const productMap = { '0': { title: 'Édition Mimosa', price: 99.00 }, '1': { title: 'Édition Violette', price: 99.00 }, '2': { title: 'Édition Menthe', price: 99.00 }, 'coffret': { title: 'Coffret Prestige – Trio', price: 69.99 } };
    const overlay = document.createElement('div'); overlay.id = 'cart-overlay';
    const drawer = document.createElement('aside'); drawer.id = 'cart-drawer'; drawer.setAttribute('aria-hidden','true');
    drawer.innerHTML = `<div class="cart-drawer-header"><h2>Mon panier</h2><button id="cart-close" class="cart-close">✕</button></div><div id="cart-drawer-content"><p class="muted">Chargement...</p></div>`;
    document.body.appendChild(overlay); document.body.appendChild(drawer);
    function getCartLocal(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
    function setCartLocal(c){ try { localStorage.setItem(CART_KEY, JSON.stringify(c)); window.dispatchEvent(new Event('storage')); } catch(e){} }
    function formatMoney(n){ return '€' + Number(n).toFixed(2); }
    function render(){ const cart = getCartLocal(); const content = document.getElementById('cart-drawer-content'); if(!cart || cart.length===0){ content.innerHTML = '<p class="muted">Votre panier est vide.</p><p><a href="index.html">Retour à la boutique</a></p>'; return; } let grand=0; let rows=''; cart.forEach(item=>{ const meta = productMap[item.id] || { title:item.id, price:item.price||0 }; const qty = item.qty||0; const sub = (meta.price||0)*qty; grand+=sub; rows += `<tr><td>${meta.title}</td><td>${qty}</td><td>${formatMoney(meta.price||0)}</td><td>${formatMoney(sub)}</td></tr>`; }); content.innerHTML = `<table><thead><tr><th>Article</th><th>Qté</th><th>PU</th><th>Sous-total</th></tr></thead><tbody>${rows}</tbody></table><p class="total">Total : ${formatMoney(grand)}</p><div class="drawer-actions"><button id="drawer-checkout">Passer commande</button><button id="drawer-clear" class="drawer-clear">Vider le panier</button></div>`; try{ document.getElementById('drawer-clear').addEventListener('click', ()=>{ setCartLocal([]); render(); updateCartLinkCount(); }); document.getElementById('drawer-checkout').addEventListener('click', ()=>{ alert('Commande effectuée — merci !'); setCartLocal([]); render(); updateCartLinkCount(); }); }catch(e){} }
    function open(){ overlay.style.display='block'; drawer.style.transform='translateX(0)'; drawer.setAttribute('aria-hidden','false'); render(); }
    function close(){ drawer.style.transform='translateX(110%)'; drawer.setAttribute('aria-hidden','true'); overlay.style.display='none'; }
    const link = q('#cart-link'); if(link){ link.addEventListener('click', (e)=>{ e.preventDefault(); open(); }); }
    overlay.addEventListener('click', close); drawer.addEventListener('click', (ev)=>{ if(ev.target && ev.target.id==='cart-close') close(); });
    window.addEventListener('storage', (e)=>{ if(e.key===CART_KEY) updateCartLinkCount(); if(drawer.getAttribute('aria-hidden')==='false') render(); });
    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) updateCartLinkCount(); });
  })();

  q('#add-cart').addEventListener('click', () => {
    const { qty, total } = computeTotal();
    const cart = getCart();
    const existing = cart.find(i => i.id === p.id);
    if (existing) { existing.qty = Math.min(50, (existing.qty || 0) + qty); } else { cart.push({ id: p.id, qty: qty }); }
    saveCart(cart);
    const totalItems = cart.reduce((s,i)=>s+(i.qty||0),0);
    updateCartLinkCount();
    if(buyResult){ buyResult.style.color = '#2a7a2a'; buyResult.textContent = `${qty} × ${p.title} ajouté au panier. Total €${total.toFixed(2)}. Articles dans le panier : ${totalItems}.`; }
  });

  q('#buy-now').addEventListener('click', () => {
    const { qty, total } = computeTotal();
    if(buyResult){ buyResult.style.color = '#2a7a2a'; buyResult.textContent = `Commande : ${qty} × ${p.title} — Total €${total.toFixed(2)}.`; }
    q('#buy-now').disabled = true;
    setTimeout(() => { q('#buy-now').disabled = false; }, 1500);
  });

});
