// Main website script with Firebase integration
import { FirebaseAPI } from './firebase-config.js';

class TwinfinityWebsite {
  constructor() {
    this.currentCategory = 'all';
    this.portfolioImages = [];
    this.lightboxIndex = 0;
    this.isLoading = true;
    this.init();
  }

  async init() {
    this.showLoading();
    await this.loadAllContent();
    this.setupEventListeners();
    this.setupAnimations();
    this.hideLoading();
    this.setCurrentYear();
  }

  showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
    }
  }

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    this.isLoading = false;
  }

  async loadAllContent() {
    try {
      // Load all content in parallel
      await Promise.all([
        this.loadSiteSettings(),
        this.loadFoundersInfo(),
        this.loadAdminProfile(),
        this.loadPortfolio(),
        this.loadServices(),
        this.loadTestimonials(),
        this.loadAboutContent()
      ]);
    } catch (error) {
      console.error('Error loading content:', error);
      // Show fallback content if Firebase fails
      this.loadFallbackContent();
    }
  }

  async loadSiteSettings() {
    try {
      const settings = await FirebaseAPI.getSiteSettings();
      if (settings) {
        // Update site title and branding
        this.updateElement('site-title', settings.siteName || 'Twinfinity Photography');
        this.updateElement('brand-text', settings.siteName || 'Twinfinity Photography');
        this.updateElement('mobile-brand-text', settings.siteName || 'Twinfinity Photography');
        this.updateElement('footer-brand-name', settings.siteName || 'Twinfinity Photography');
        this.updateElement('footer-site-name', settings.siteName || 'Twinfinity Photography');

        // Update hero section
        this.updateElement('hero-title', settings.heroTitle || 'Timeless stories, beautifully told');
        this.updateElement('hero-subtitle', settings.heroSubtitle || 'Elegant wedding, event, and portrait photography that feels refined, modern, and unforgettable.');

        // Update contact information
        if (settings.email) {
          this.updateContactInfo('contact-email', 'footer-email', settings.email, `mailto:${settings.email}`);
        }
        if (settings.phone) {
          this.updateContactInfo('contact-phone', 'footer-phone', settings.phone, `tel:${settings.phone}`);
        }

        // Update social links
        if (settings.socialLinks) {
          this.updateSocialLinks(settings.socialLinks);
        }
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  }

  async loadFoundersInfo() {
    try {
      const founders = await FirebaseAPI.getFoundersSettings();
      if (founders) {
        this.updateElement('founders-title', founders.title || 'Meet the Team');
        this.updateElement('founders-description', founders.description || 'Professional photography team specializing in capturing your most precious moments.');
      }
    } catch (error) {
      console.error('Error loading founders info:', error);
    }
  }

  async loadAdminProfile() {
    try {
      const profile = await FirebaseAPI.getAdminProfile();
      if (profile) {
        // Update admin profile information in founders section
        const adminSection = document.getElementById('admin-bio-section');
        if (adminSection && profile.name) {
          this.updateElement('admin-name', profile.name);
          
          // Build admin meta information
          const metaInfo = [];
          if (profile.experience) metaInfo.push(profile.experience);
          if (profile.location) metaInfo.push(profile.location);
          
          this.updateElement('admin-experience', profile.experience || '');
          this.updateElement('admin-location', profile.location || '');
          
          if (profile.specialties) {
            this.updateElement('admin-specialties', profile.specialties);
          }
          
          if (profile.bio) {
            this.updateElement('admin-bio', profile.bio);
          }
          
          adminSection.style.display = 'block';
        }

        // Load admin profile photo
        if (profile.photo) {
          this.loadFounderPhotos([profile.photo]);
        }
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  }

  loadFounderPhotos(photos) {
    const container = document.getElementById('founders-photos');
    if (container && photos && photos.length > 0) {
      container.innerHTML = photos.map((photo, index) => `
        <div class="founder-photo reveal">
          <img src="${photo}" alt="Team member ${index + 1}" loading="lazy" />
        </div>
      `).join('');
    }
  }

  async loadPortfolio() {
    try {
      // Load categories first
      const categories = await FirebaseAPI.getCategories();
      if (categories && categories.length > 0) {
        this.loadPortfolioFilters(categories);
      }

      // Load gallery images
      const images = await FirebaseAPI.getGalleryImages();
      if (images && images.length > 0) {
        this.portfolioImages = images;
        this.displayPortfolio(images);
      } else {
        this.showNoPortfolio();
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
      this.showNoPortfolio();
    }
  }

  loadPortfolioFilters(categories) {
    const container = document.getElementById('portfolio-filters');
    if (!container) return;

    // Keep the 'All' filter and add category filters
    const activeCategories = categories.filter(cat => cat.active);
    const filtersHtml = activeCategories.map(category => `
      <button class="filter" data-filter="${category.id}">${category.name}</button>
    `).join('');

    // Find the 'All' button and add category filters after it
    const allButton = container.querySelector('[data-filter="all"]');
    if (allButton) {
      allButton.insertAdjacentHTML('afterend', filtersHtml);
    }
  }

  displayPortfolio(images, filterCategory = null) {
    const container = document.getElementById('portfolio-grid');
    if (!container) return;

    let filteredImages = images;
    if (filterCategory && filterCategory !== 'all') {
      filteredImages = images.filter(img => img.categoryId === filterCategory);
    }

    if (filteredImages.length === 0) {
      container.innerHTML = '<p class="no-content">No images found for this category.</p>';
      return;
    }

    container.innerHTML = filteredImages.map((image, index) => `
      <div class="portfolio-item reveal" data-category="${image.categoryId}" onclick="window.website.openLightbox(${index})">
        <div class="portfolio-image">
          <img src="${image.url}" alt="${image.alt || 'Portfolio image'}" loading="lazy" />
          <div class="portfolio-overlay">
            <i class="fas fa-expand-alt"></i>
          </div>
        </div>
      </div>
    `).join('');

    // Store current filtered images for lightbox
    this.currentPortfolioImages = filteredImages;
  }

  showNoPortfolio() {
    const noPortfolio = document.getElementById('no-portfolio');
    if (noPortfolio) {
      noPortfolio.style.display = 'block';
    }
  }

  async loadServices() {
    try {
      const [services, addons] = await Promise.all([
        FirebaseAPI.getServices(),
        FirebaseAPI.getAddons()
      ]);

      if (services && services.length > 0) {
        this.displayServices(services.filter(s => s.active));
      }

      if (addons && addons.length > 0) {
        this.displayAddons(addons.filter(a => a.active));
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  displayServices(services) {
    const container = document.getElementById('services-list');
    if (!container || !services.length) return;

    container.innerHTML = services.map(service => `
      <div class="service-card reveal">
        <div class="service-header">
          <h3 class="service-name">${service.name}</h3>
          ${service.tag ? `<span class="service-tag">${service.tag}</span>` : ''}
        </div>
        <p class="service-description">${service.description}</p>
        <div class="service-price">
          <span class="price">${this.formatPrice(service.price, service.currency)}</span>
          ${service.unit ? `<span class="unit">/ ${service.unit}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  displayAddons(addons) {
    const container = document.getElementById('addons-list');
    const section = document.getElementById('addons-section');
    
    if (!container || !addons.length) return;

    section.style.display = 'block';
    
    container.innerHTML = addons.map(addon => `
      <div class="addon-chip reveal">
        <span class="addon-name">${addon.name}</span>
        <span class="addon-price">${this.formatPrice(addon.price, addon.currency)}${addon.unit ? ` / ${addon.unit}` : ''}</span>
      </div>
    `).join('');
  }

  async loadTestimonials() {
    try {
      const testimonials = await FirebaseAPI.getTestimonials();
      if (testimonials && testimonials.length > 0) {
        this.displayTestimonials(testimonials.filter(t => t.active));
      } else {
        this.showNoTestimonials();
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      this.showNoTestimonials();
    }
  }

  displayTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (!container || !testimonials.length) return;

    container.innerHTML = testimonials.map(testimonial => `
      <div class="testimonial-card reveal">
        <div class="testimonial-content">
          <i class="fas fa-quote-left quote-icon"></i>
          <blockquote>${testimonial.text}</blockquote>
        </div>
        <div class="testimonial-author">
          <strong>— ${testimonial.author}</strong>
        </div>
      </div>
    `).join('');
  }

  showNoTestimonials() {
    const noTestimonials = document.getElementById('no-testimonials');
    if (noTestimonials) {
      noTestimonials.style.display = 'block';
    }
  }

  async loadAboutContent() {
    try {
      const settings = await FirebaseAPI.getSiteSettings();
      if (settings && settings.aboutText) {
        const container = document.getElementById('about-content');
        if (container) {
          container.innerHTML = `<p class="about-text">${settings.aboutText}</p>`;
        }
      }
    } catch (error) {
      console.error('Error loading about content:', error);
    }
  }

  loadFallbackContent() {
    // Provide fallback content if Firebase fails
    this.updateElement('hero-title', 'Twinfinity Photography');
    this.updateElement('hero-subtitle', 'Professional photography services for your special moments.');
    this.updateElement('about-content', '<p>We are dedicated to capturing your most precious moments with style and elegance.</p>');
  }

  setupEventListeners() {
    // Navigation
    this.setupNavigation();
    
    // Portfolio filters
    this.setupPortfolioFilters();
    
    // Booking form
    this.setupBookingForm();
    
    // Lightbox
    this.setupLightbox();
    
    // Mobile menu
    this.setupMobileMenu();
    
    // Smooth scrolling
    this.setupSmoothScrolling();
  }

  setupNavigation() {
    // Handle navigation clicks
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  setupPortfolioFilters() {
    const container = document.getElementById('portfolio-filters');
    if (!container) return;

    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter')) {
        e.preventDefault();
        
        // Update active filter
        container.querySelectorAll('.filter').forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        
        // Filter portfolio
        const category = e.target.dataset.filter;
        this.currentCategory = category;
        
        if (this.portfolioImages.length > 0) {
          this.displayPortfolio(this.portfolioImages, category);
          this.setupRevealAnimations(); // Re-setup animations for new elements
        }
      }
    });
  }

  setupBookingForm() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleBookingSubmission(e.target);
    });
  }

  async handleBookingSubmission(form) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const statusEl = document.getElementById('booking-status');

    try {
      // Show loading state
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline-flex';
      submitBtn.disabled = true;
      statusEl.style.display = 'none';

      // Get form data
      const formData = new FormData(form);
      const bookingData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        date: formData.get('date'),
        eventType: formData.get('event'),
        message: formData.get('message')
      };

      // Submit to Firebase
      await FirebaseAPI.addOrder(bookingData);

      // Show success message
      this.showToast('Booking request submitted successfully! We\'ll contact you within 24 hours.', 'success');
      form.reset();

    } catch (error) {
      console.error('Booking submission error:', error);
      this.showToast('Error submitting booking request. Please try again or contact us directly.', 'error');
    } finally {
      // Reset button state
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  }

  setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    // Close lightbox
    closeBtn.addEventListener('click', () => this.closeLightbox());
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) this.closeLightbox();
    });

    // Navigate lightbox
    prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
    nextBtn.addEventListener('click', () => this.navigateLightbox(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (lightbox.getAttribute('aria-hidden') === 'false') {
        switch(e.key) {
          case 'Escape':
            this.closeLightbox();
            break;
          case 'ArrowLeft':
            this.navigateLightbox(-1);
            break;
          case 'ArrowRight':
            this.navigateLightbox(1);
            break;
        }
      }
    });
  }

  openLightbox(index) {
    if (!this.currentPortfolioImages || this.currentPortfolioImages.length === 0) return;

    this.lightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightbox-image');
    const caption = document.getElementById('lightbox-caption');

    const currentImage = this.currentPortfolioImages[index];
    if (currentImage) {
      image.src = currentImage.url;
      image.alt = currentImage.alt || 'Portfolio image';
      caption.textContent = currentImage.alt || '';

      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  navigateLightbox(direction) {
    if (!this.currentPortfolioImages || this.currentPortfolioImages.length === 0) return;

    this.lightboxIndex += direction;
    
    if (this.lightboxIndex < 0) {
      this.lightboxIndex = this.currentPortfolioImages.length - 1;
    } else if (this.lightboxIndex >= this.currentPortfolioImages.length) {
      this.lightboxIndex = 0;
    }

    const image = document.getElementById('lightbox-image');
    const caption = document.getElementById('lightbox-caption');
    const currentImage = this.currentPortfolioImages[this.lightboxIndex];

    if (currentImage) {
      image.src = currentImage.url;
      image.alt = currentImage.alt || 'Portfolio image';
      caption.textContent = currentImage.alt || '';
    }
  }

  setupMobileMenu() {
    const burger = document.querySelector('.burger');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');
    const backdrop = document.querySelector('.backdrop');

    if (burger && sidebar) {
      burger.addEventListener('click', () => {
        sidebar.setAttribute('aria-hidden', 'false');
        burger.setAttribute('aria-expanded', 'true');
      });

      [sidebarClose, backdrop].forEach(el => {
        if (el) {
          el.addEventListener('click', () => {
            sidebar.setAttribute('aria-hidden', 'true');
            burger.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }
  }

  setupSmoothScrolling() {
    // Add smooth scrolling behavior to navigation links
    const navLinks = document.querySelectorAll('.nav a[href^="#"], .sidebar a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          
          // Close mobile menu if open
          const sidebar = document.getElementById('sidebar');
          if (sidebar && sidebar.getAttribute('aria-hidden') === 'false') {
            sidebar.setAttribute('aria-hidden', 'true');
            document.querySelector('.burger').setAttribute('aria-expanded', 'false');
          }
          
          // Scroll to target
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      });
    });
  }

  setupAnimations() {
    // Intersection Observer for reveal animations
    this.setupRevealAnimations();
    
    // Parallax effect for hero section
    this.setupParallaxEffects();
  }

  setupRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  setupParallaxEffects() {
    // Add subtle parallax effects on scroll
    window.addEventListener('scroll', () => {
      if (this.isLoading) return;
      
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.bgfx');
      
      parallaxElements.forEach(el => {
        const speed = 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }

  // Utility methods
  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  updateContactInfo(primaryId, secondaryId, content, href) {
    [primaryId, secondaryId].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = content;
        if (element.tagName === 'A') {
          element.href = href;
        }
      }
    });
  }

  updateSocialLinks(socialLinks) {
    const socialElements = [
      { ids: ['social-instagram', 'footer-instagram'], key: 'instagram' },
      { ids: ['social-facebook', 'footer-facebook'], key: 'facebook' },
      { ids: ['social-whatsapp', 'footer-whatsapp'], key: 'whatsapp' }
    ];

    socialElements.forEach(({ ids, key }) => {
      if (socialLinks[key]) {
        ids.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.href = socialLinks[key];
          }
        });
      }
    });
  }

  formatPrice(amount, currency = 'PKR') {
    try {
      return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  }

  setCurrentYear() {
    const yearElements = document.querySelectorAll('#year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => el.textContent = currentYear);
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');

    messageEl.textContent = message;
    icon.className = `toast-icon fas ${
      type === 'success' ? 'fa-check-circle' : 
      type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
    }`;
    
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }
}

// Initialize website when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.website = new TwinfinityWebsite();
  });
} else {
  window.website = new TwinfinityWebsite();
}

// Make website instance globally available
window.website = window.website || new TwinfinityWebsite();

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

// Load configuration from Firebase (parallel + prefetch gallery once)
async function loadConfigFromFirebase(forceReload = false) {
  try {
    console.log('Loading configuration from Firebase...', forceReload ? '(Force reload)' : '');

    const [
      settingsDocSnap,
      categoriesSnap,
      servicesSnap,
      addonsSnap,
      testimonialsSnap,
      foundersDocSnap,
      adminProfileDocSnap,
      gallerySnap
    ] = await Promise.all([
      getDoc(doc(db, 'settings', 'site')),
      getDocs(query(collection(db, 'categories'), orderBy('order'))),
      getDocs(query(collection(db, 'services'), where('active', '==', true))),
      getDocs(query(collection(db, 'addons'), where('active', '==', true))),
      getDocs(query(collection(db, 'testimonials'), where('active', '==', true))),
      getDoc(doc(db, 'settings', 'founders')),
      getDoc(doc(db, 'settings', 'adminProfile')),
      getDocs(query(collection(db, 'gallery'), where('published', '==', true)))
    ]);

    // Settings
    if (settingsDocSnap.exists()) {
      const settings = settingsDocSnap.data();
      CONFIG.email = settings.email || CONFIG.email;
      CONFIG.phoneNumber = settings.phone || CONFIG.phoneNumber;
      CONFIG.theme = settings.theme || CONFIG.theme;
      CONFIG.heroTitle = settings.heroTitle || CONFIG.heroTitle;
      CONFIG.heroSubtitle = settings.heroSubtitle || CONFIG.heroSubtitle;
      CONFIG.aboutText = settings.aboutText || CONFIG.aboutText;
      CONFIG.siteName = settings.siteName || 'Twinfinity Photography';
      if (settings.socialLinks) CONFIG.socials = { ...CONFIG.socials, ...settings.socialLinks };
    }

    // Categories
    const categories = categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Prefetch gallery once and build by-category cache and counts
    const galleryItems = gallerySnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const byCat = {};
    for (const item of galleryItems) {
      if (!item.categoryId) continue;
      if (!byCat[item.categoryId]) byCat[item.categoryId] = [];
      byCat[item.categoryId].push(item);
    }
    Object.keys(byCat).forEach(cat => byCat[cat].sort((a,b) => Number(a.order||0) - Number(b.order||0)));
    CONFIG.galleryByCategory = byCat;
    for (const cat of categories) {
      if (cat.active) CONFIG.galleries[cat.id] = (byCat[cat.id] || []).length;
    }

    // Services
    CONFIG.services = servicesSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => Number(a.order||0) - Number(b.order||0));

    // Addons
    CONFIG.addons = addonsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => Number(a.order||0) - Number(b.order||0));

    // Testimonials
    CONFIG.testimonials = testimonialsSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a,b) => Number(a.order||0) - Number(b.order||0));

    // Founders/Admin profile
    if (foundersDocSnap.exists()) CONFIG.founders = foundersDocSnap.data();
    if (adminProfileDocSnap.exists()) CONFIG.adminProfile = adminProfileDocSnap.data();

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
    // Use preloaded cache if available (fast path)
    let images = (CONFIG.galleryByCategory && CONFIG.galleryByCategory[category]) ? [...CONFIG.galleryByCategory[category]] : null;

    if (!images) {
      // Fallback: fetch published once
      const imagesSnapshot = await getDocs(query(
        collection(db, 'gallery'),
        where('published', '==', true)
      ));
      images = imagesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(img => img.categoryId === category)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    }
    
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
    const aboutContainer = document.getElementById('about-content');
    if (aboutContainer && CONFIG.aboutText) {
      aboutContainer.innerHTML = `
        <p>${CONFIG.aboutText}</p>
        <p class="muted">We believe in honest emotions, elegant composition, and the kind of refined editing that looks beautiful today and timeless tomorrow. Every session is planned with care so you can simply be present — we'll capture the rest.</p>
        <ul class="muted" style="margin:8px 0 0 18px;">
          <li>Editorial-quality retouching and color grading</li>
          <li>Professional lighting and equipment for any venue</li>
          <li>Clear communication, punctuality, and dependable delivery</li>
          <li>Secure online gallery — easy sharing with family and friends</li>
        </ul>
      `;
    } else if (aboutContainer) {
      aboutContainer.innerHTML = '<p class="text-muted">About content can be managed from the admin dashboard.</p>';
    }

    // Update founders section copy (title + first paragraph) if available
    const foundersTitleEl = document.getElementById('founders-title');
    const foundersDescEl = document.getElementById('founders-description');
    const foundersSecondEl = document.getElementById('founders-second-para');
    
    if (CONFIG.founders) {
      if (foundersTitleEl && CONFIG.founders.title) foundersTitleEl.textContent = CONFIG.founders.title;
      if (foundersDescEl && CONFIG.founders.description) foundersDescEl.textContent = CONFIG.founders.description;
    }
    
    // Show admin profile information if available
    if (CONFIG.adminProfile) {
      if (CONFIG.adminProfile.bio && foundersSecondEl) {
        foundersSecondEl.textContent = CONFIG.adminProfile.bio;
      }
      
      // Update founders section with admin profile info
      if (CONFIG.adminProfile.name && foundersTitleEl && !CONFIG.founders?.title) {
        foundersTitleEl.textContent = `Meet ${CONFIG.adminProfile.name}`;
      }
    }

    // Render founders photo: prioritize admin profile photo
    const photosHolder = document.getElementById('founders-photos');
    if (photosHolder) {
      photosHolder.innerHTML = '';
      
      if (CONFIG?.adminProfile?.photo) {
        // Show admin profile photo
        console.log('Loading admin profile photo:', CONFIG.adminProfile.photo);
        const card = document.createElement('div');
        card.className = 'founder-card parallax';
        card.setAttribute('data-depth', '12');
        card.style.setProperty('--dur', '12s');
        
        const img = document.createElement('img');
        img.alt = CONFIG.adminProfile.name || 'Admin';
        img.src = CONFIG.adminProfile.photo;
        img.style.objectFit = 'cover';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '12px';
        
        // Add error handling for image load
        img.onerror = () => {
          console.error('Failed to load admin profile photo:', CONFIG.adminProfile.photo);
          // Fallback to default founders if admin photo fails
          photosHolder.innerHTML = '';
          if (CONFIG?.founders?.count) {
            loadFounders(Number(CONFIG.founders.count));
          }
        };
        
        const shine = document.createElement('span');
        shine.className = 'shine';
        card.appendChild(img);
        card.appendChild(shine);
        photosHolder.appendChild(card);
        console.log('Admin profile photo added to DOM');
      } else if (CONFIG?.founders?.count && CONFIG.founders.count > 0) {
        // Fallback to default founder images only if no admin photo
        console.log('Loading default founder images, count:', CONFIG.founders.count);
        loadFounders(Number(CONFIG.founders.count));
      } else {
        // Show message for admin to upload photo
        const placeholder = document.createElement('div');
        placeholder.className = 'founder-placeholder';
        placeholder.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #666;">
            <i class="fas fa-user" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
            <p>Admin can upload profile photo from the dashboard</p>
          </div>
        `;
        photosHolder.appendChild(placeholder);
        console.log('No admin photo or founders configured - showing placeholder');
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
  const testimonialsContainer = document.getElementById('testimonials-container');
  if (!testimonialsContainer) return;
  
  if (!CONFIG.testimonials || CONFIG.testimonials.length === 0) {
    testimonialsContainer.innerHTML = '<p class="text-muted">No testimonials available. Admin can add testimonials from the dashboard.</p>';
    return;
  }
  
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
    const filtersContainer = document.getElementById('portfolio-filters');
    const categoriesContainer = document.getElementById('portfolio-categories');
    
    if (!filtersContainer || !categoriesContainer) {
      console.error('Portfolio containers not found');
      return;
    }
    
    // Get categories from Firebase
    const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), orderBy('order')));
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('Setting up dynamic categories:', categories);
    
    // Keep the 'All' button and add category filters
    const allButton = filtersContainer.querySelector('[data-filter="all"]');
    const existingFilters = filtersContainer.querySelectorAll('.filter:not([data-filter="all"])');
    existingFilters.forEach(filter => filter.remove());
    
    // Clear existing categories
    categoriesContainer.innerHTML = '';
    
    // Add dynamic category filters and sections
    categories.forEach(category => {
      if (category.active) {
        // Add filter button
        const button = document.createElement('button');
        button.className = 'filter';
        button.setAttribute('data-filter', category.id);
        button.textContent = category.name;
        filtersContainer.appendChild(button);
        
        // Create category section
        const categorySection = document.createElement('div');
        categorySection.className = 'category reveal';
        categorySection.setAttribute('data-category', category.id);
        categorySection.innerHTML = `
          <h3>${category.name}</h3>
          <div class="gallery" id="gallery-${category.id}" data-category="${category.id}"></div>
        `;
        categoriesContainer.appendChild(categorySection);
        
        console.log(`Added category: ${category.name} (${category.id})`);
      }
    });
    
    // Setup filter functionality
    setupFilters();
    
    // If no categories exist, show message
    if (categories.filter(c => c.active).length === 0) {
      categoriesContainer.innerHTML = '<p class="text-muted" style="text-align: center; padding: 40px;">No portfolio categories available. Admin can add categories from the dashboard.</p>';
    }
    
  } catch (error) {
    console.error('Error setting up dynamic filters:', error);
  }
}

// Init
// Force reload configuration (for admin changes)
window.refreshWebsiteContent = async () => {
  try {
    console.log('Refreshing website content...');
    await loadConfigFromFirebase(true);
    await loadDynamicContent();
    console.log('Website content refreshed successfully');
  } catch (error) {
    console.error('Error refreshing website content:', error);
  }
};

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
