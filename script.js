// Twinfinity Photography front-end interactions
// Import Firebase functions for dynamic content
import { getFirestore, doc, getDoc, collection, getDocs, addDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

// Firebase configuration (same as admin)
const firebaseConfig = {
  apiKey: "AIzaSyCAmMqSfWvPXoFQnmKdiM2lf9A3ik1W2sI",
  authDomain: "twinfinityphotography-eea27.firebaseapp.com",
  projectId: "twinfinityphotography-eea27",
  storageBucket: "twinfinityphotography-eea27.firebasestorage.app",
  messagingSenderId: "264522763978",
  appId: "1:264522763978:web:d46ffb2adc64834095ae33",
  measurementId: "G-5NLLKF6E24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dynamic CONFIG object - will be populated from Firebase
let CONFIG = {
  theme: 'vibrant',
  email: 'twinfinitycaptures@gmail.com',
  phoneNumber: '923185459061',
  socials: {
    instagram: 'https://www.instagram.com/twinfinitycaptures?igsh=NmpkbWd1czlkeWtw',
    facebook: 'https://facebook.com/yourprofile',
    whatsapp: 'https://wa.me/923185459061'
  },
  galleries: {},
  founders: { count: 2 },
  services: [],
  addons: [],
  heroTitle: 'Timeless stories, beautifully told',
  heroSubtitle: 'Elegant wedding, event, and portrait photography that feels refined, modern, and unforgettable.',
  aboutText: 'We are Twinfinity Photography — storytellers dedicated to preserving your most meaningful moments through timeless imagery.',
  testimonials: []
};

// Load configuration from Firebase
async function loadConfigFromFirebase() {
  try {
    console.log('Loading configuration from Firebase...');
    
    // Load site settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      CONFIG.email = settings.email || CONFIG.email;
      CONFIG.phoneNumber = settings.phone || CONFIG.phoneNumber;
      CONFIG.theme = settings.theme || CONFIG.theme;
      CONFIG.heroTitle = settings.heroTitle || CONFIG.heroTitle;
      CONFIG.heroSubtitle = settings.heroSubtitle || CONFIG.heroSubtitle;
      CONFIG.aboutText = settings.aboutText || CONFIG.aboutText;
      CONFIG.siteName = settings.siteName || 'Twinfinity Photography';
      
      if (settings.socialLinks) {
        CONFIG.socials = { ...CONFIG.socials, ...settings.socialLinks };
      }
    }
    
    // Load categories and build galleries object
    const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), orderBy('order')));
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Build galleries object with image counts
    for (const category of categories) {
      if (category.active) {
        const imagesSnapshot = await getDocs(query(
          collection(db, 'gallery'), 
          where('categoryId', '==', category.id)
        ));
        CONFIG.galleries[category.id] = imagesSnapshot.docs.length;
      }
    }
    
    // Load services
    const servicesSnapshot = await getDocs(query(collection(db, 'services'), orderBy('order')));
    CONFIG.services = servicesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(service => service.active);
    
    // Load add-ons
    const addonsSnapshot = await getDocs(query(collection(db, 'addons'), orderBy('order')));
    CONFIG.addons = addonsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(addon => addon.active);
    
    // Load testimonials
    const testimonialsSnapshot = await getDocs(query(collection(db, 'testimonials'), orderBy('order')));
    CONFIG.testimonials = testimonialsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(testimonial => testimonial.active);
    
    // Load founders info
    const foundersDoc = await getDoc(doc(db, 'settings', 'founders'));
    if (foundersDoc.exists()) {
      CONFIG.founders = foundersDoc.data();
    }

    // Load admin profile (used to display photo and bio in founders section)
    const adminProfileDoc = await getDoc(doc(db, 'settings', 'adminProfile'));
    if (adminProfileDoc.exists()) {
      CONFIG.adminProfile = adminProfileDoc.data();
    }
    
    console.log('Configuration loaded from Firebase:', CONFIG);
  } catch (error) {
    console.error('Error loading configuration from Firebase:', error);
    console.log('Using default configuration');
  }
}

function sanitizePhone(num) {
  return (num || '').toString().replace(/\D/g, '');
}

// 1) Gallery Loader - Fetch images from Firebase
async function loadGallery(category, count, targetSelector) {
  const container = document.querySelector(targetSelector) || document.querySelector(`#gallery-${category}`);
  if (!container) return;

  try {
    // Fetch images from Firebase
    const imagesSnapshot = await getDocs(query(
      collection(db, 'gallery'),
      where('categoryId', '==', category),
      orderBy('order')
    ));
    
    const images = imagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (images.length === 0) {
      console.log(`No images found for category: ${category}`);
      return;
    }

    const frag = document.createDocumentFragment();
    
    images.forEach((image, index) => {
      const tile = document.createElement('div');
      tile.className = 'tile reveal';
      tile.setAttribute('data-tilt', '');

      const img = document.createElement('img');
      img.alt = image.alt || `${category} image ${index + 1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = image.url;

      // Error handling for Cloudinary images
      img.onerror = () => {
        console.warn(`Failed to load image: ${image.url}`);
        tile.style.display = 'none';
      };

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
    });
    
    container.appendChild(frag);
  } catch (error) {
    console.error(`Error loading gallery for ${category}:`, error);
    // Fallback to old method if Firebase fails
    loadGalleryFallback(category, count, targetSelector);
  }
}

// Fallback gallery loader (original method)
function loadGalleryFallback(category, count, targetSelector) {
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

// 5) Booking form -> Firebase + WhatsApp
async function sendToWhatsApp() {
  const name = document.getElementById('name')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const phone = document.getElementById('phone')?.value?.trim();
  const address = document.getElementById('address')?.value?.trim();
  const date = document.getElementById('date')?.value;
  const eventType = document.getElementById('event')?.value;
  const message = document.getElementById('message')?.value?.trim();

  // Basic validation
  if (!name || !email || !phone || !address || !date || !eventType) {
    // Find the first empty required field and focus it
    const fields = [name, email, phone, address, date, eventType];
    const fieldNames = ['name', 'email', 'phone', 'address', 'date', 'event'];
    const firstEmpty = fields.findIndex(field => !field);
    const firstEmptyElement = document.getElementById(fieldNames[firstEmpty]);
    firstEmptyElement?.focus();
    
    alert('Please fill in all required fields.');
    return;
  }

// CLEANED MERGE CONFLICT START
  const submitButton = document.querySelector('#booking-form button[type="submit"]');
  const originalText = submitButton.textContent;
  
  try {
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    // Save order to Firebase
    const orderData = {
      name,
      email,
      phone,
      address,
      date,
      eventType,
      message: message || '',
      status: 'new',
      createdAt: new Date()
    };
    
    await addDoc(collection(db, 'orders'), orderData);
    console.log('Order saved to Firebase');
    
    // Show success message
    alert('Booking request submitted successfully! We will contact you soon.');
    
    // Reset form
    document.getElementById('booking-form').reset();
    
    // Optional: Also open WhatsApp
    const phoneNumber = sanitizePhone(CONFIG.phoneNumber);
    const raw = `Hello Twinfinity Captures ✨,\n` +
      `I’d like to book a session with the following details:\n\n` +
      `👤 Name: ${name}\n` +
      `📧 Email: ${email}\n` +
      `📞 Phone: ${phone}\n` +
      `📍 Address: ${address}\n` +
      `📅 Event Date: ${date}\n` +
      `📸 Event Type: ${eventType}\n` +
      `📝 Notes: ${message || 'No additional notes'}\n\n` +
      `Looking forward to your response!`;
=======
  const raw = `Hello Twinfinity Captures ✨,\n` +
    `I’d like to book a session with the following details:\n\n` +
    `👤 Name: ${name}\n` +
    `📧 Email: ${email}\n` +
    `📅 Event Date: ${date}\n` +
    `📸 Event Type: ${eventType}\n` +
    `📝 Notes: ${message}\n\n` +
    `Looking forward to your response!`;
// CLEANED MERGE CONFLICT END

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(raw)}`;
    window.open(url, '_blank');
    
  } catch (error) {
    console.error('Error saving order:', error);
    alert('There was an error submitting your request. Please try again or contact us directly.');
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
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
  } catch {
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
    
    // Create title element safely
    const title = document.createElement('h3');
    title.className = 'service-title';
    title.textContent = svc.name;
    
    if (svc.tag) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = svc.tag;
      title.appendChild(badge);
    }
    
    // Create description element
    const desc = document.createElement('p');
    desc.className = 'service-desc';
    desc.textContent = svc.desc || '';
    
    // Create price element
    const priceDiv = document.createElement('div');
    priceDiv.className = 'price';
    priceDiv.textContent = formatMoney(svc.price, svc.currency);
    
    if (svc.unit) {
      const unit = document.createElement('span');
      unit.className = 'unit';
      unit.textContent = svc.unit;
      priceDiv.appendChild(unit);
    }
    
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(priceDiv);
    list.appendChild(card);
  });

  // Add-ons
  const addonsEl = document.getElementById('addons-list');
  if (addonsEl) {
    addonsEl.innerHTML = '';
    (CONFIG.addons || []).forEach((ad) => {
      const chip = document.createElement('span');
      chip.className = 'chip reveal';
      chip.textContent = ad.name + ' ';
      
      const price = document.createElement('span');
      price.className = 'chip-price';
      price.textContent = formatMoney(ad.price, ad.currency) + (ad.unit ? `/${ad.unit}` : '');
      
      chip.appendChild(price);
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

// Dynamic content loading functions
async function loadDynamicContent() {
  try {
    // Update hero content
    const heroTitle = document.querySelector('.hero h1');
    const heroSubtitle = document.querySelector('.hero .lead');
    
    if (heroTitle && CONFIG.heroTitle) {
      const titleWords = CONFIG.heroTitle.split(' ');
      const accentWordIndex = titleWords.findIndex(word => word.toLowerCase() === 'timeless');
      if (accentWordIndex !== -1) {
        titleWords[accentWordIndex] = `<span class="accent">${titleWords[accentWordIndex]}</span>`;
      }
      heroTitle.innerHTML = titleWords.join(' ');
    }
    
    if (heroSubtitle && CONFIG.heroSubtitle) {
      heroSubtitle.textContent = CONFIG.heroSubtitle;
    }
    
    // Update about section
    const aboutText = document.querySelector('#about p');
    if (aboutText && CONFIG.aboutText) {
      aboutText.textContent = CONFIG.aboutText;
    }

    // Update founders section copy (title + first paragraph) if available
    const foundersTitleEl = document.querySelector('#founders .section-title');
    const foundersParas = document.querySelectorAll('#founders .founders-copy p');
    if (CONFIG.founders) {
      if (foundersTitleEl && CONFIG.founders.title) foundersTitleEl.textContent = CONFIG.founders.title;
      if (foundersParas[0] && CONFIG.founders.description) foundersParas[0].textContent = CONFIG.founders.description;
    }

    // Render founders photo: if adminProfile.photo exists, show it; else fall back to assets
    const photosHolder = document.getElementById('founders-photos');
    if (photosHolder) {
      photosHolder.innerHTML = '';
      if (CONFIG?.adminProfile?.photo) {
        const card = document.createElement('div');
        card.className = 'founder-card parallax';
        card.setAttribute('data-depth', '12');
        card.style.setProperty('--dur', '12s');
        const img = document.createElement('img');
        img.alt = CONFIG.adminProfile.name || 'Founder';
        img.src = CONFIG.adminProfile.photo;
        const shine = document.createElement('span');
        shine.className = 'shine';
        card.appendChild(img);
        card.appendChild(shine);
        photosHolder.appendChild(card);
      } else if (CONFIG?.founders?.count) {
        loadFounders(Number(CONFIG.founders.count));
      }
    }
    
    // Load testimonials
    if (CONFIG.testimonials && CONFIG.testimonials.length > 0) {
      loadTestimonials();
    }
    
    // Load dynamic categories for event type dropdown
    await loadEventTypeOptions();
    
  } catch (error) {
    console.error('Error loading dynamic content:', error);
  }
}

// Load testimonials
function loadTestimonials() {
  const testimonialsContainer = document.querySelector('.testimonials');
  if (!testimonialsContainer || !CONFIG.testimonials.length) return;
  
  testimonialsContainer.innerHTML = CONFIG.testimonials.map(testimonial => `
    <blockquote class="testimonial reveal">
      "${testimonial.text}"
      <span>— ${testimonial.author}</span>
    </blockquote>
  `).join('');
}

// Load event type options from categories
async function loadEventTypeOptions() {
  try {
    const eventSelect = document.getElementById('event');
    if (!eventSelect) return;
    
    // Keep default options and add dynamic categories
    const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), orderBy('order')));
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    categories.forEach(category => {
      if (category.active && category.name) {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        eventSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error('Error loading event type options:', error);
  }
}

// Update setupFilters to handle dynamic categories
async function setupDynamicFilters() {
  try {
    const buttonsContainer = document.querySelector('.filters');
    const categoriesContainer = document.querySelector('#portfolio .container');
    
    if (!buttonsContainer || !categoriesContainer) return;
    
    // Get categories from Firebase
    const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), orderBy('order')));
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Clear existing filter buttons (except 'All')
    const allButton = buttonsContainer.querySelector('[data-filter="all"]');
    buttonsContainer.innerHTML = '';
    buttonsContainer.appendChild(allButton);
    
    // Add dynamic category filters
    categories.forEach(category => {
      if (category.active) {
        const button = document.createElement('button');
        button.className = 'filter';
        button.setAttribute('data-filter', category.id);
        button.textContent = category.name;
        buttonsContainer.appendChild(button);
        
        // Create category section if it doesn't exist
        let categorySection = document.querySelector(`[data-category="${category.id}"]`);
        if (!categorySection) {
          categorySection = document.createElement('div');
          categorySection.className = 'category reveal';
          categorySection.setAttribute('data-category', category.id);
          categorySection.innerHTML = `
            <h3>${category.name}</h3>
            <div class="gallery" id="gallery-${category.id}" data-category="${category.id}"></div>
          `;
          categoriesContainer.appendChild(categorySection);
        }
      }
    });
    
    // Setup filter functionality
    setupFilters();
    
  } catch (error) {
    console.error('Error setting up dynamic filters:', error);
  }
}

// Init
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load configuration from Firebase first
    await loadConfigFromFirebase();
    
    // Apply theme
    applyTheme();
    
    // Load dynamic content
    await loadDynamicContent();
    
    // Setup dynamic filters and categories
    await setupDynamicFilters();
    
    // Founders photos
    if (CONFIG.founders?.count) loadFounders(Number(CONFIG.founders.count));

    // Populate galleries from Firebase
    const entries = Object.entries(CONFIG.galleries || {});
    for (const [category, count] of entries) {
      await loadGallery(category, Number(count) || 0, `#gallery-${category}`);
    }

    setupSmoothScroll();
    setupScrollReveal();
    setupBookingForm();
    initContactLinks();
    renderServices();
    setupHeaderScroll();
    setupSidebar();
    setupTilt();
    setupParallax();
    setupLogo();

    // Footer year
    const yEl = document.getElementById('year');
    if (yEl) yEl.textContent = new Date().getFullYear();
    
    console.log('Site initialized successfully with Firebase data');
  } catch (error) {
    console.error('Error initializing site:', error);
  }
});
