const editions = [
  {
    title: "Édition Mimosa",
    desc: "Une lumière douce et équilibrée.<br>Clarté printanière et harmonie sensorielle.",
    img: "images/cannette_main.png",
    imgStyle: "",
    model: "3d_model/canette_mimosa.glb",
    color: "#bfa76a"
  },
  {
    title: "Édition Violette",
    desc: "Une atmosphère feutrée et maîtrisée.<br>Profondeur calme et équilibre sensoriel.",
    img: "images/cannette_main.png",
    imgStyle: "filter:grayscale(0.7);",
    model: "3d_model/canette_violette.glb",
    color: "#9f5edc"
  },
  {
    title: "Édition Menthe",
    desc: "Une lumière douce et équilibrée.<br>Clarté printanière et harmonie sensorielle.",
    img: "images/cannette_main.png",
    imgStyle: "filter:hue-rotate(60deg);",
    model: "3d_model/canette_menthe.glb",
    color: "#66bfa0"
  }
];

let current = 0;
const modelRadius = '600m';
let modelFront = null;
let modelBack = null;
let visibleModel = null;
let hiddenModel = null;

function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111' : '#fff';
}

function updateEdition() {
  const card = document.querySelector('.edition-large');
  if (!card) return;
  // prefer the visible stacked model if available
  const model = visibleModel || card.querySelector('#canette3d-front') || card.querySelector('#canette3d');
  const h3 = card.querySelector('h3');
  const p = card.querySelector('p');


  h3.textContent = editions[current].title;
  p.innerHTML = editions[current].desc;
  try { h3.style.color = editions[current].color || ''; } catch (e) {}

  try {
    const buyBtn = card.querySelector('.experience-btn');
    if (buyBtn) {
      const col = editions[current].color || '';
      if (col) {
        const rgb = hexToRgb(col);
        buyBtn.style.background = col;
        buyBtn.style.color = getContrastColor(col);
     
        if (editions[current] && editions[current].title && editions[current].title.includes('Prestige')) {
          buyBtn.style.color = '#fff';
        }
  
        if (editions[current] && editions[current].title && editions[current].title.includes('Mimosa')) {
          buyBtn.style.color = '#fff';
        }
        buyBtn.style.boxShadow = `0 2px 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
        buyBtn.style.transition = 'background 0.18s, transform 0.18s, box-shadow 0.3s, color 0.18s';
        
        try {
          buyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = current;
            const url = `acheter.html?idx=${encodeURIComponent(idx)}`;
            window.location.href = url;
          });
        } catch (e) {  }
      } else {
        buyBtn.style.background = '';
        buyBtn.style.color = '';
        buyBtn.style.boxShadow = '';
      }
    }
  } catch (e) {  }

  if (current === 0 && model) {
    model.setAttribute('camera-orbit', `0deg 75deg ${modelRadius}`); 
  }
  
  if (editions[current] && editions[current].model) {
    const newSrc = editions[current].model;
    if (visibleModel && hiddenModel) {
      const curSrc = visibleModel.getAttribute('src');
      if (curSrc === newSrc) {

          try {
            const styleVal = editions[current].imgStyle || '';
            const filterVal = styleVal.replace(/^filter:\s*/,'');
            if (filterVal) {
              visibleModel.style.transition = 'filter 0.6s ease, opacity 0.6s';
              visibleModel.style.filter = filterVal;
              
              setTimeout(() => { visibleModel.style.filter = ''; }, 1200);
            }
          } catch (e) {  }
          spinModel360(visibleModel, 900);
      } else {
        
        const doCrossfade = () => {
          
          hiddenModel.style.transition = 'opacity 0.9s cubic-bezier(.2,.9,.3,1)';
          visibleModel.style.transition = 'opacity 0.9s cubic-bezier(.2,.9,.3,1)';
          hiddenModel.style.visibility = 'visible';
          hiddenModel.style.opacity = '0';
          
          requestAnimationFrame(() => {
            hiddenModel.style.opacity = '1';
            visibleModel.style.opacity = '0';
          });
          
          spinModel360(hiddenModel, 900);
          
          setTimeout(() => {
            
            visibleModel.style.visibility = 'hidden';
            visibleModel.style.opacity = '0';
            hiddenModel.style.visibility = 'visible';
            hiddenModel.style.opacity = '1';
            
            const tmp = visibleModel;
            visibleModel = hiddenModel;
            hiddenModel = tmp;
            
            if (hiddenModel) {
              hiddenModel.style.visibility = 'hidden';
              hiddenModel.style.opacity = '0';
            }
          }, 950);
        };

        
        try {
          const hiddenSrc = hiddenModel.getAttribute('src');
          if (hiddenSrc === newSrc) {
            try { hiddenModel.setAttribute('camera-orbit', `0deg 75deg ${modelRadius}`); } catch(e){}
            doCrossfade();
          } else {
            const once = () => {
              hiddenModel.removeEventListener('load', once);
              doCrossfade();
            };
            hiddenModel.addEventListener('load', once);
            
            hiddenModel.addEventListener('load', function _setHiddenOrbit(){
              try { hiddenModel.setAttribute('camera-orbit', `0deg 75deg ${modelRadius}`); } catch(e){}
              hiddenModel.removeEventListener('load', _setHiddenOrbit);
            });
            hiddenModel.style.opacity = '0';
            hiddenModel.style.visibility = 'hidden';
            hiddenModel.setAttribute('src', newSrc);
          }
        } catch (e) {
          
          hiddenModel.addEventListener('load', () => doCrossfade());
          hiddenModel.setAttribute('src', newSrc);
        }
      }
      visibleModel.setAttribute('alt', editions[current].title);
    } else {
      
      if (model.getAttribute('src') !== newSrc) {
        const onceLoad = () => {
          model.removeEventListener('load', onceLoad);
          spinModel360(model, 900);
        };
        model.addEventListener('load', onceLoad);
        model.setAttribute('src', newSrc);
      } else {
        spinModel360(model, 900);
      }
      
      try {
        model.style.visibility = 'visible';
        model.style.opacity = '1';
      } catch (e) {}
      model.setAttribute('alt', editions[current].title);
    }
  }
}


let spinAnim = null;
function spinModel360(modelEl, duration = 900) {
  if (!modelEl) return;
  if (spinAnim) cancelAnimationFrame(spinAnim);
  const start = performance.now();
  const radius = modelRadius;
  const animate = (t) => {
    const elapsed = t - start;
    const progress = Math.min(1, elapsed / duration);
    const angle = Math.round(progress * 360);
    modelEl.setAttribute('camera-orbit', `${angle}deg 75deg ${radius}`);
    if (progress < 1) {
      spinAnim = requestAnimationFrame(animate);
    } else {
      modelEl.setAttribute('camera-orbit', `0deg 75deg ${radius}`);
      spinAnim = null;
    }
  };
  spinAnim = requestAnimationFrame(animate);
}


document.addEventListener('DOMContentLoaded', () => {
  const nextBtn = document.querySelector('.arrow-next');

  modelFront = document.getElementById('canette3d-front');
  modelBack = document.getElementById('canette3d-back');
  
  if (modelFront) {
    modelFront.style.opacity = '1';
    modelFront.style.visibility = 'visible';
    try { modelFront.setAttribute('camera-orbit', `0deg 75deg ${modelRadius}`); } catch(e){}
    
    modelFront.addEventListener('load', function _setFrontOrbit(){
      try { modelFront.setAttribute('camera-orbit', `0deg 75deg ${modelRadius}`); } catch(e){}
      modelFront.removeEventListener('load', _setFrontOrbit);
    });
  }
  if (modelBack) {
    modelBack.style.opacity = '0';
    modelBack.style.visibility = 'hidden';
    try { modelBack.setAttribute('camera-orbit', `0deg 75deg ${modelRadius}`); } catch(e){}
    modelBack.addEventListener('load', function _setBackOrbit(){
      try { modelBack.setAttribute('camera-orbit', `0deg 75deg ${modelRadius}`); } catch(e){}
      modelBack.removeEventListener('load', _setBackOrbit);
    });
  }
  visibleModel = modelFront || document.querySelector('#canette3d');
  hiddenModel = modelBack || null;
  let rotateAnim = null;

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      current = (current + 1) % editions.length;
      updateEdition();
  
      if (rotateAnim) cancelAnimationFrame(rotateAnim);
      let angle = 0;
      const spin = () => {
        angle += 2;
        
        let radius = modelRadius;
       
        if (visibleModel) visibleModel.setAttribute('camera-orbit', `${angle}deg 75deg ${radius}`);
        if (angle < 360) {
          rotateAnim = requestAnimationFrame(spin);
        } else {
         
          if (visibleModel) visibleModel.setAttribute('camera-orbit', `0deg 75deg ${modelRadius}`);
        }
      };
      spin();
    });
  }
  updateEdition();

  
  const slideshow = document.getElementById('experience-slideshow');
  if (slideshow) {
    const slides = Array.from(slideshow.querySelectorAll('.slide'));
    const dots = Array.from(slideshow.querySelectorAll('.dot'));
    if (slides.length > 0) {
      let idx = slides.findIndex(s => s.classList.contains('active'));
      if (idx < 0) idx = 0;
      const delay = 4500; 

      function transitionTo(next) {
        if (next === idx) return;
        slideshow.classList.add('transitioning');
        
        setTimeout(() => {
          slides[idx].classList.remove('active');
          slides[next].classList.add('active');
          // update dots
          if (dots && dots.length) {
            dots.forEach(d => d.classList.remove('active'));
            if (dots[next]) dots[next].classList.add('active');
          }
          idx = next;
          
          setTimeout(() => slideshow.classList.remove('transitioning'), 900);
        }, 200);
      }

     
      if (dots && dots.length) {
        dots.forEach((d, i) => {
          d.addEventListener('click', () => {
            transitionTo(i);
          });
        });
       
        dots.forEach(d => d.classList.remove('active'));
        if (dots[idx]) dots[idx].classList.add('active');
      }

      setInterval(() => {
        const next = (idx + 1) % slides.length;
        transitionTo(next);
      }, delay);
    }
  }

  
  const heroSlideshow = document.getElementById('hero-slideshow');
  if (heroSlideshow) {
    const slides2 = Array.from(heroSlideshow.querySelectorAll('.slide'));
    const dots2 = Array.from(heroSlideshow.querySelectorAll('.dot'));
    
    const heroTexts = [
      {
        title: 'Essence Pure<br><span style="color:#9f5edc;">Édition Violette</span>',
        desc: 'Une profondeur florale maîtrisée. Fraîcheur feutrée et pureté raffinée.',
        color: '#9f5edc'
      },
      {
        title: 'Essence Pure<br><span style="color:#66bfa0;">Édition Menthe</span>',
        desc: 'Un souffle d’une grande fraîcheur. Clarté végétale et précision sensorielle.',
        color: '#66bfa0'
      },
      {
        title: 'Essence Pure<br><span style="color:#bfa76a;">Édition Mimosa</span>',
        desc: 'Une quête dédiée à la clarté sensorielle. L\'Édition Mimosa vise la précision et la fidélité d\'un profil floral délicat.',
        color: '#bfa76a'
      }
    ];

    function updateHeroText(idx, animate = true) {
      try {
        const titleEl = document.querySelector('.hero-title');
        const descEl = document.querySelector('.hero-desc');
        const btn = document.getElementById('scroll-to-carrousel') || document.querySelector('.buy-btn');
        if (!titleEl || !descEl) return;
        const t = heroTexts[idx] || heroTexts[2];

        const swapWithFade = (el, html, delay = 360) => {
          try {
            el.classList.add('hero-text-hidden');
            setTimeout(() => {
              el.innerHTML = html;
              el.classList.remove('hero-text-hidden');
            }, delay);
          } catch (e) {}
        };

        if (animate) {
          swapWithFade(titleEl, t.title, 340);
         
          setTimeout(() => swapWithFade(descEl, t.desc, 320), 80);
        } else {
          titleEl.innerHTML = t.title;
          descEl.innerHTML = t.desc;
        }

        if (btn && t.color) {
          btn.style.transition = 'background 0.25s ease, color 0.25s ease';
          btn.style.background = t.color;
          try {
            if (idx === 2 || (t.title && (t.title.includes('Mimosa') || t.title.includes('Menthe')))) {
              btn.style.color = '#fff';
            } else {
              btn.style.color = getContrastColor(t.color);
            }
          } catch(e) {}
        }
      } catch (e) {  }
    }
    
    slides2.forEach(s => {
      const overlay = s.querySelector('.can-overlay');
      if (overlay) {
        overlay.style.transition = 'opacity 0.9s cubic-bezier(.2,.9,.3,1)';
        overlay.style.opacity = s.classList.contains('active') ? '1' : '0';
      }
    });
    if (slides2.length > 0) {
      let idx2 = slides2.findIndex(s => s.classList.contains('active'));
      if (idx2 < 0) idx2 = 0;
      
      try { updateHeroText(idx2, false); } catch (e) {}
      const delay2 = 3800;

      function transitionToHero(next) {
        if (next === idx2) return;
        const cur = slides2[idx2];
        const nxt = slides2[next];
        heroSlideshow.classList.add('transitioning');

     
        const curOverlay = cur.querySelector('.can-overlay');
        const nxtOverlay = nxt.querySelector('.can-overlay');
        if (!curOverlay || !nxtOverlay) {
          
          slides2[idx2].classList.remove('active');
          slides2[next].classList.add('active');
          if (dots2 && dots2.length) {
            dots2.forEach(d => d.classList.remove('active'));
            if (dots2[next]) dots2[next].classList.add('active');
          }
          idx2 = next;
          setTimeout(() => heroSlideshow.classList.remove('transitioning'), 700);
          return;
        }

        
        nxtOverlay.style.transition = 'opacity 0.9s cubic-bezier(.2,.9,.3,1)';
        curOverlay.style.transition = 'opacity 0.9s cubic-bezier(.2,.9,.3,1)';
        
        cur.style.display = 'block';
        nxt.style.display = 'block';
      
        nxtOverlay.style.opacity = '0';
        nxtOverlay.style.visibility = 'visible';

        
        nxt.style.zIndex = 2;
        cur.style.zIndex = 1;

        
        requestAnimationFrame(() => {
          nxtOverlay.style.opacity = '1';
          curOverlay.style.opacity = '0';
        });

        
        setTimeout(() => {
          
          curOverlay.style.opacity = '';
          nxtOverlay.style.opacity = '';
          
          cur.classList.remove('active');
          nxt.classList.add('active');
          if (dots2 && dots2.length) {
            dots2.forEach(d => d.classList.remove('active'));
            if (dots2[next]) dots2[next].classList.add('active');
          }
          
          try { updateHeroText(next); } catch(e) {}
        
          nxt.style.zIndex = '';
          cur.style.zIndex = '';
          
          cur.style.display = '';
          nxt.style.display = '';
          idx2 = next;
          setTimeout(() => heroSlideshow.classList.remove('transitioning'), 100);
        }, 920);
      }

      if (dots2 && dots2.length) {
        dots2.forEach((d, i) => {
          d.addEventListener('click', () => {
            transitionToHero(i);
          });
        });
        dots2.forEach(d => d.classList.remove('active'));
        if (dots2[idx2]) dots2[idx2].classList.add('active');
      }

      setInterval(() => {
        const next = (idx2 + 1) % slides2.length;
        transitionToHero(next);
      }, delay2);
    }
  }
});

