// Aura Inc - Interactions page produit

document.addEventListener('DOMContentLoaded', function() {
    const buyBtn = document.querySelector('.buy-btn');
    if (buyBtn) {
        buyBtn.addEventListener('click', function() {
            // Animation bouton
            buyBtn.textContent = 'Merci pour votre achat !';
            buyBtn.style.background = '#bfa76a';
            buyBtn.style.color = '#fff';
            buyBtn.disabled = true;
            setTimeout(() => {
                buyBtn.textContent = 'Acheter – 299€';
                buyBtn.style.background = '#111';
                buyBtn.style.color = '#fff';
                buyBtn.disabled = false;
            }, 2500);
        });
    }
});
