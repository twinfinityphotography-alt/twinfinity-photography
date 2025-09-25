// Twinfinity Photography front-end interactions

// Site-wide config: update these once and the site updates everywhere.
const CONFIG = {
  theme: 'vibrant', // options: 'muted' | 'vibrant'
  email: 'twinfinitycaptures@gmail.com',
  phoneNumber: '923185459061', // international format, no plus
  socials: {
    instagram: 'https://www.instagram.com/twinfinitycaptures?igsh=NmpkbWd1czlkeWtw',
    facebook: 'https://facebook.com/yourprofile',
    whatsapp: 'https://wa.me/923185459061'
  },
  galleries: {
    wedding: 14,
    event: 7,
    portrait: 8,
  },
  founders: { count: 2 },
  services: [
    { id: 'photography', name: 'Photography', price: 25000, currency: 'PKR', unit: 'per day', tag: 'Full-day', desc: 'Full-day photoshoot. Travel and accommodation not included.' },
    { id: 'videography', name: 'Videography', price: 40000, currency: 'PKR', unit: 'per day', tag: 'Full-day', desc: 'Full-day videography coverage. Travel and accommodation not included.' },
  ],
  addons: [
    { id: 'album-basic', name: 'Photo Album (Basic)', price: 12000, currency: 'PKR', unit: 'starting' },
    { id: 'album-premium', name: 'Photo Album (Premium 12x36)', price: 18000, currency: 'PKR', unit: 'starting' },
    { id: 'drone', name: 'Drone Coverage', price: 10000, currency: 'PKR', unit: 'per event' },
  ],
};

function sanitizePhone(num) {
  return (num || '').toString().replace(/\D/g, '');
}

// 1) Gallery Loader
function loadGallery(category, count, targetSelector) {
  const container = document.querySelector(targetSelector) || document.querySelector(`#gallery-${category}`);
  if (!container) return;

  const frag = document.createDocumentFragment();
  const tryExts = ['jpg', 'jpeg', 'png', 'webp'];
  for (let i = 1; i <= count; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile reveal';
    tile.setAttribute('data-tilt', '');

    const img = document.createElement('img');
    img.alt = `${category} ${i}`;
    img.loading = 'lazy';
    img.decoding = 'async';

    // Try multiple extensions until one loads
    let k = 0;
    const setNext = () => {
      if (k >= tryExts.length) { tile.style.display = 'none'; return; }
      const ext = tryExts[k++];
      const src = `assets/images/${category}/${category}${i}.${ext}`;
      img.src = src;
    };
    img.onerror = setNext;
    setNext();

    // For lightbox
    img.addEventListener('click', () => openLightbox(img.src, img.alt));

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    overlay.appendChild(label);

    tile.appendChild(img);
    tile.appendChild(overlay);
    frag.appendChild(tile);
  }
  container.appendChild(frag);
}

// 2) Lightbox
const lightboxEl = (() => {
  const el = document.getElementById('lightbox');
  const closeBtn = el?.querySelector('.lightbox-close');
  closeBtn?.addEventListener('click', closeLightbox);
  el?.addEventListener('click', (e) => {
    if (e.target === el) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
  return el;
})();

function openLightbox(src, alt = '') {
  const img = document.getElementById('lightbox-image');
  if (!lightboxEl || !img) return;
  img.src = src;
  img.alt = alt || 'Photo';
  lightboxEl.classList.add('open');
  lightboxEl.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  if (!lightboxEl) return;
  const img = document.getElementById('lightbox-image');
  if (img) img.src = '';
  lightboxEl.classList.remove('open');
  lightboxEl.setAttribute('aria-hidden', 'true');
}

// 3) Smooth scroll (CSS handles most; this avoids hash-jump offset issues if header is sticky)
function setupSmoothScroll() {
  const header = document.querySelector('.site-header');
  const headerHeight = () => (header ? header.getBoundingClientRect().height : 0);
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const targetId = a.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const el = document.querySelector(targetId);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight() - 8;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', targetId);
    });
  });
}

// 4) Scroll reveal animations
function setupScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = Number(entry.target.getAttribute('data-reveal-delay') || 0);
        setTimeout(() => {
          entry.target.classList.add('reveal-visible');
        }, delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.reveal').forEach((el, idx) => {
    el.setAttribute('data-reveal-delay', (idx % 5) * 60);
    io.observe(el);
  });
}

// 5) Booking form -> WhatsApp
function sendToWhatsApp() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const date = document.getElementById('date').value;
  const eventType = document.getElementById('event').value;
  const message = document.getElementById('message').value.trim();

  const phoneNumber = sanitizePhone(CONFIG.phoneNumber);

  const raw = `Hello Twinfinity Photography ✨,\n` +
    `I’d like to book a session with the following details:\n\n` +
    `👤 Name: ${name}\n` +
    `📧 Email: ${email}\n` +
    `📅 Event Date: ${date}\n` +
    `📸 Event Type: ${eventType}\n` +
    `📝 Notes: ${message}\n\n` +
    `Looking forward to your response!`;

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(raw)}`;
  window.open(url, '_blank');
}

function setupBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendToWhatsApp();
  });
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'PKR', maximumFractionDigits: 0 }).format(amount);
  } catch (_) {
    // Fallback if locale/currency not supported
    return `${currency || 'PKR'} ${amount}`;
  }
}

function renderServices() {
  const list = document.getElementById('services-list');
  if (!list) return;
  list.innerHTML = '';
  (CONFIG.services || []).forEach((svc) => {
    const card = document.createElement('div');
    card.className = 'card reveal';
    const priceText = `${formatMoney(svc.price, svc.currency)} <span class="unit">${svc.unit || ''}</span>`;
    card.innerHTML = `
      <h3 class="service-title">${svc.name}${svc.tag ? `<span class=\"badge\">${svc.tag}</span>` : ''}</h3>
      <p class="service-desc">${svc.desc || ''}</p>
      <div class="price">${priceText}</div>
    `;
    list.appendChild(card);
  });

  // Add-ons
  const addonsEl = document.getElementById('addons-list');
  if (addonsEl) {
    addonsEl.innerHTML = '';
    (CONFIG.addons || []).forEach((ad) => {
      const chip = document.createElement('span');
      chip.className = 'chip reveal';
      chip.innerHTML = `${ad.name} <span class="chip-price">${formatMoney(ad.price, ad.currency)}${ad.unit ? `/${ad.unit}` : ''}</span>`;
      addonsEl.appendChild(chip);
    });
  }
}

function setupLogo() {
  const img = document.querySelector('.brand img');
  if (!img) return;
  const base = 'assets/images/logo/logo';
  const exts = ['png','webp','jpg','jpeg'];
  let i = 0;
  const next = () => {
    if (i >= exts.length) { img.style.display = 'none'; return; }
    img.src = `${base}.${exts[i++]}`;
  };
  img.onerror = next;
  next();
}

function initContactLinks() {
  const email = CONFIG.email?.trim();
  const phone = sanitizePhone(CONFIG.phoneNumber);

  const emailA = document.getElementById('contact-email');
  if (email && emailA) {
    emailA.href = `mailto:${email}`;
    emailA.textContent = email;
  }

  const waLink = document.getElementById('whatsapp-link');
  if (phone && waLink) {
    waLink.href = `https://wa.me/${phone}`;
  }

  const ig = document.getElementById('social-instagram');
  if (ig && CONFIG.socials?.instagram) ig.href = CONFIG.socials.instagram;

  const fb = document.getElementById('social-facebook');
  if (fb && CONFIG.socials?.facebook) fb.href = CONFIG.socials.facebook;

  const wsa = document.getElementById('social-whatsapp');
  if (wsa) wsa.href = `https://wa.me/${phone || ''}` || CONFIG.socials?.whatsapp || wsa.href;
}

function setupHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const toggle = () => {
    if (window.scrollY > 10) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const burger = document.querySelector('.burger');
  const closeBtn = document.querySelector('.sidebar-close');
  const backdrop = document.querySelector('.backdrop');
  if (!sidebar || !burger || !closeBtn || !backdrop) return;

  const open = () => {
    sidebar.classList.add('open');
    backdrop.classList.add('show');
    burger.setAttribute('aria-expanded', 'true');
    sidebar.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('show');
    burger.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-hidden', 'true');
  };

  burger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

function setupFilters() {
  const buttons = document.querySelectorAll('.filter');
  const categories = document.querySelectorAll('.category[data-category]');
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      categories.forEach((cat) => {
        const type = cat.getAttribute('data-category');
        cat.style.display = (!filter || filter === 'all' || filter === type) ? '' : 'none';
      });
      window.scrollTo({ top: document.getElementById('portfolio').offsetTop - 70, behavior: 'smooth' });
    });
  });
}

function setupParallax() {
  const items = document.querySelectorAll('.parallax');
  const onScroll = () => {
    const y = window.scrollY;
    items.forEach((el) => {
      const depth = Number(el.getAttribute('data-depth') || 10);
      const delta = Math.min(24, (y * depth) / 140);
      el.style.transform = `translateY(${delta}px)`;
    });
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function setupTilt() {
  const tiles = document.querySelectorAll('[data-tilt]');
  tiles.forEach((tile) => {
    const dampen = 40; // lower = more tilt
    function handle(e) {
      const rect = tile.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rx = (0.5 - py) * dampen; // rotateX
      const ry = (px - 0.5) * dampen; // rotateY
      tile.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
    function reset() { tile.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'; }
    tile.addEventListener('mousemove', handle);
    tile.addEventListener('mouseleave', reset);
    tile.addEventListener('touchmove', (e) => { if (e.touches[0]) handle(e.touches[0]); }, { passive: true });
    tile.addEventListener('touchend', reset);
  });

  // Shine follow for founders
  document.querySelectorAll('.founder-card').forEach((card) => {
    const shine = card.querySelector('.shine');
    function move(e) {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      shine.style.transform = `translate(${x - 50}%, ${y - 50}%) rotate(8deg)`;
    }
    card.addEventListener('mousemove', move);
    card.addEventListener('mouseleave', () => { shine.style.transform = 'translate(0,0) rotate(8deg)'; });
  });
}

function loadFounders(count) {
  const holder = document.getElementById('founders-photos');
  if (!holder) return;
  const tryExts = ['jpg','jpeg','png','webp'];
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= count; i++) {
    const card = document.createElement('div');
    card.className = 'founder-card parallax';
    card.setAttribute('data-depth', i % 2 === 0 ? '8' : '14');
    card.style.setProperty('--dur', `${10 + i * 1.7}s`);

    const img = document.createElement('img');
    img.alt = `Founder ${i}`;
    let k = 0;
    const setNext = () => {
      if (k >= tryExts.length) { card.remove(); return; }
      const ext = tryExts[k++];
      img.src = `assets/images/sisters/sisters${i}.${ext}`;
    };
    img.onerror = setNext;
    setNext();

    const shine = document.createElement('span');
    shine.className = 'shine';

    card.appendChild(img);
    card.appendChild(shine);
    frag.appendChild(card);
  }
  holder.appendChild(frag);
}

function applyTheme() {
  const root = document.documentElement;
  root.classList.remove('theme-muted','theme-vibrant');
  const t = (CONFIG.theme || 'muted').toLowerCase();
  root.classList.add(t === 'vibrant' ? 'theme-vibrant' : 'theme-muted');
}

// Init
window.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  // Founders photos
  if (CONFIG.founders?.count) loadFounders(Number(CONFIG.founders.count));

  // Populate galleries from sequentially named files based on CONFIG
  const entries = Object.entries(CONFIG.galleries || {});
  for (const [category, count] of entries) {
    loadGallery(category, Number(count) || 0, `#gallery-${category}`);
  }

  setupSmoothScroll();
  setupScrollReveal();
  setupBookingForm();
  initContactLinks();
  renderServices();
  setupHeaderScroll();
  setupSidebar();
  setupFilters();
  setupTilt();
  setupParallax();
  setupLogo();

  // Footer year
  const yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
});
