// Fallback Storage System - Uses localStorage when Firebase is not available
class FallbackStorage {
  constructor() {
    this.prefix = 'twinfinity_';
    this.initialized = false;
    this.defaultData = {
      categories: [
        { id: 'wedding', name: 'Wedding', description: 'Beautiful wedding photography', order: 1, active: true },
        { id: 'event', name: 'Event', description: 'Corporate and social events', order: 2, active: true },
        { id: 'portrait', name: 'Portrait', description: 'Professional portrait sessions', order: 3, active: true }
      ],
      services: [
        {
          id: 'photography',
          name: 'Photography',
          description: 'Full-day photoshoot. Travel and accommodation not included.',
          price: 25000,
          currency: 'PKR',
          unit: 'per day',
          tag: 'Full-day',
          active: true,
          order: 1
        },
        {
          id: 'videography',
          name: 'Videography',
          description: 'Full-day videography coverage. Travel and accommodation not included.',
          price: 40000,
          currency: 'PKR',
          unit: 'per day',
          tag: 'Full-day',
          active: true,
          order: 2
        }
      ],
      addons: [
        { id: 'album-basic', name: 'Photo Album (Basic)', price: 12000, currency: 'PKR', unit: 'starting', active: true, order: 1 },
        { id: 'album-premium', name: 'Photo Album (Premium 12x36)', price: 18000, currency: 'PKR', unit: 'starting', active: true, order: 2 },
        { id: 'drone', name: 'Drone Coverage', price: 10000, currency: 'PKR', unit: 'per event', active: true, order: 3 }
      ],
      testimonials: [
        { id: 'testimonial1', text: 'They captured our wedding beautifully — every tiny moment! Highly recommended.', author: 'Ayesha & Hamza', active: true, order: 1 },
        { id: 'testimonial2', text: 'Professional team, punctual, and incredible results for our corporate gala.', author: 'NEXA Corp', active: true, order: 2 },
        { id: 'testimonial3', text: 'Our pre-wedding shoot felt effortless and the photos look like magazine covers.', author: 'Sara & Daniyal', active: true, order: 3 }
      ],
      settings: {
        siteName: 'Twinfinity Photography',
        email: 'twinfinitycaptures@gmail.com',
        phone: '923185459061',
        heroTitle: 'Timeless stories, beautifully told',
        heroSubtitle: 'Elegant wedding, event, and portrait photography that feels refined, modern, and unforgettable.',
        aboutText: 'We are Twinfinity Photography — storytellers dedicated to preserving your most meaningful moments through timeless imagery.',
        theme: 'vibrant',
        socialLinks: {
          instagram: 'https://www.instagram.com/twinfinitycaptures?igsh=NmpkbWd1czlkeWtw',
          facebook: 'https://facebook.com/yourprofile',
          whatsapp: 'https://wa.me/923185459061'
        }
      },
      adminProfile: {
        name: 'Twinfinity Team',
        bio: 'Professional photography team specializing in weddings, events, and portraits.',
        profileImage: '',
        experience: '5+ years',
        specialties: ['Weddings', 'Events', 'Portraits'],
        location: 'Pakistan'
      },
      gallery: [],
      orders: []
    };
    this.init();
  }

  init() {
    // Initialize default data if not exists
    Object.keys(this.defaultData).forEach(key => {
      if (!this.get(key)) {
        this.set(key, this.defaultData[key]);
      }
    });
    this.initialized = true;
    console.log('Fallback storage initialized');
  }

  get(key) {
    const data = localStorage.getItem(this.prefix + key);
    return data ? JSON.parse(data) : null;
  }

  set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  // Simulate Firebase API methods
  async getCategories() {
    return this.get('categories') || this.defaultData.categories;
  }

  async addCategory(data) {
    const categories = await this.getCategories();
    const newCategory = { ...data, id: data.id || Date.now().toString(), createdAt: new Date() };
    categories.push(newCategory);
    this.set('categories', categories);
    return { id: newCategory.id };
  }

  async updateCategory(id, data) {
    const categories = await this.getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...data, updatedAt: new Date() };
      this.set('categories', categories);
    }
  }

  async deleteCategory(id) {
    const categories = await this.getCategories();
    const filtered = categories.filter(cat => cat.id !== id);
    this.set('categories', filtered);
  }

  async getServices() {
    return this.get('services') || this.defaultData.services;
  }

  async addService(data) {
    const services = await this.getServices();
    const newService = { ...data, id: Date.now().toString(), createdAt: new Date() };
    services.push(newService);
    this.set('services', services);
    return { id: newService.id };
  }

  async updateService(id, data) {
    const services = await this.getServices();
    const index = services.findIndex(svc => svc.id === id);
    if (index !== -1) {
      services[index] = { ...services[index], ...data, updatedAt: new Date() };
      this.set('services', services);
    }
  }

  async deleteService(id) {
    const services = await this.getServices();
    const filtered = services.filter(svc => svc.id !== id);
    this.set('services', filtered);
  }

  async getAddons() {
    return this.get('addons') || this.defaultData.addons;
  }

  async addAddon(data) {
    const addons = await this.getAddons();
    const newAddon = { ...data, id: Date.now().toString(), createdAt: new Date() };
    addons.push(newAddon);
    this.set('addons', addons);
    return { id: newAddon.id };
  }

  async updateAddon(id, data) {
    const addons = await this.getAddons();
    const index = addons.findIndex(addon => addon.id === id);
    if (index !== -1) {
      addons[index] = { ...addons[index], ...data, updatedAt: new Date() };
      this.set('addons', addons);
    }
  }

  async deleteAddon(id) {
    const addons = await this.getAddons();
    const filtered = addons.filter(addon => addon.id !== id);
    this.set('addons', filtered);
  }

  async getTestimonials() {
    return this.get('testimonials') || this.defaultData.testimonials;
  }

  async addTestimonial(data) {
    const testimonials = await this.getTestimonials();
    const newTestimonial = { ...data, id: Date.now().toString(), createdAt: new Date() };
    testimonials.push(newTestimonial);
    this.set('testimonials', testimonials);
    return { id: newTestimonial.id };
  }

  async updateTestimonial(id, data) {
    const testimonials = await this.getTestimonials();
    const index = testimonials.findIndex(test => test.id === id);
    if (index !== -1) {
      testimonials[index] = { ...testimonials[index], ...data, updatedAt: new Date() };
      this.set('testimonials', testimonials);
    }
  }

  async deleteTestimonial(id) {
    const testimonials = await this.getTestimonials();
    const filtered = testimonials.filter(test => test.id !== id);
    this.set('testimonials', filtered);
  }

  async getSiteSettings() {
    return this.get('settings') || this.defaultData.settings;
  }

  async updateSiteSettings(data) {
    const settings = await this.getSiteSettings();
    const updated = { ...settings, ...data, updatedAt: new Date() };
    this.set('settings', updated);
  }

  async getAdminProfile() {
    return this.get('adminProfile') || this.defaultData.adminProfile;
  }

  async updateAdminProfile(data) {
    const profile = await this.getAdminProfile();
    const updated = { ...profile, ...data, updatedAt: new Date() };
    this.set('adminProfile', updated);
  }

  async getGalleryImages(categoryId = null) {
    const gallery = this.get('gallery') || [];
    if (categoryId) {
      return gallery.filter(img => img.categoryId === categoryId);
    }
    return gallery;
  }

  async addGalleryImage(data) {
    const gallery = await this.getGalleryImages();
    const newImage = { ...data, id: Date.now().toString(), createdAt: new Date() };
    gallery.push(newImage);
    this.set('gallery', gallery);
    return { id: newImage.id };
  }

  async deleteGalleryImage(id) {
    const gallery = await this.getGalleryImages();
    const filtered = gallery.filter(img => img.id !== id);
    this.set('gallery', filtered);
  }

  async getOrders() {
    return this.get('orders') || [];
  }

  async addOrder(data) {
    const orders = await this.getOrders();
    const newOrder = { ...data, id: Date.now().toString(), createdAt: new Date(), status: 'new' };
    orders.unshift(newOrder); // Add to beginning for newest first
    this.set('orders', orders);
    return { id: newOrder.id };
  }

  async updateOrderStatus(id, status, notes = '') {
    const orders = await this.getOrders();
    const index = orders.findIndex(order => order.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], status, notes, updatedAt: new Date() };
      this.set('orders', orders);
    }
  }
}

export { FallbackStorage };