(function(){
  const CART_KEY = 'aura_cart';
  function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
  function setCart(c){ try{ localStorage.setItem(CART_KEY, JSON.stringify(c)); window.dispatchEvent(new Event('storage')); }catch(e){} }
  function formatMoney(n){ return '€' + Number(n).toFixed(2); }

  function updateCartLink(){ const badge = document.getElementById('cart-count'); if(!badge) return; const n = getCart().reduce((s,i)=>s+(i.qty||0),0); badge.textContent = n; badge.style.display = n? 'inline-flex':'none'; }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.navbar-links a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === "#" || href === "#accueil") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        var targetId = href.substring(1);
        var target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    var btn = document.getElementById('scroll-to-carrousel');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById('carrousel');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
    updateCartLink();

    const productMap = { '0': { title: 'Édition Mimosa', price: 24.99 }, '1': { title: 'Édition Violette', price: 24.99 }, '2': { title: 'Édition Menthe', price: 24.99 }, 'coffret': { title: 'Coffret Prestige – Trio', price: 69.99 } };
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');
    const content = document.getElementById('cart-drawer-content');
    const cartLink = document.getElementById('cart-link');
    const closeBtn = document.getElementById('cart-close');

    function renderDrawer(){
      const cart = getCart();
      if(!cart || cart.length === 0){ content.innerHTML = '<p class="muted">Votre panier est vide.</p><p><a href="Partiel/index.html">Retour à la boutique</a></p>'; return; }
      let grand = 0; let rows = '';
      cart.forEach(item => {
        const meta = productMap[item.id] || { title: item.id, price: item.price||0 };
        const qty = item.qty||0; const sub = (meta.price||0)*qty; grand += sub;
        rows += `<tr><td>${meta.title}</td><td>${qty}</td><td>${formatMoney(meta.price||0)}</td><td>${formatMoney(sub)}</td></tr>`;
      });
      content.innerHTML = `<table><thead><tr><th>Article</th><th>Qté</th><th>PU</th><th>Sous-total</th></tr></thead><tbody>${rows}</tbody></table><p class="total">Total : ${formatMoney(grand)}</p><div class="drawer-actions"><button id="drawer-checkout">Commander</button><button id="drawer-clear" class="drawer-clear">Vider le panier</button></div>`;
      
      try{
        document.getElementById('drawer-clear').addEventListener('click', ()=>{ setCart([]); renderDrawer(); updateCartLink(); });
        document.getElementById('drawer-checkout').addEventListener('click', ()=>{ alert('Commande effectuée — merci !'); setCart([]); renderDrawer(); updateCartLink(); });
      }catch(e){}
    }

    function openDrawer(){ if(overlay) overlay.style.display='block'; if(drawer) drawer.setAttribute('aria-hidden','false'); drawer.classList.add('open'); renderDrawer(); }
    function closeDrawer(){ if(drawer) drawer.classList.remove('open'); if(drawer) drawer.setAttribute('aria-hidden','true'); if(overlay) overlay.style.display='none'; }

    if(cartLink) cartLink.addEventListener('click', (e)=>{ e.preventDefault(); openDrawer(); });
    if(overlay) overlay.addEventListener('click', closeDrawer);
    if(closeBtn) closeBtn.addEventListener('click', closeDrawer);

  }); 

  window.addEventListener('storage', function(e){ if(e.key === CART_KEY) updateCartLink(); });
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) updateCartLink(); });

})();

