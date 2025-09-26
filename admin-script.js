// Admin Dashboard JavaScript
import { 
  loginAdmin, 
  logoutAdmin, 
  onAuthChange, 
  FirebaseAPI, 
  CLOUDINARY_CONFIG
} from './firebase-config.js';
import { FallbackStorage } from './fallback-storage.js';

class AdminDashboard {
  constructor() {
    this.currentUser = null;
    this.currentSection = 'overview';
    this.editingItem = null;
    this.selectedFiles = [];
    this.init();
  }

  async init() {
    this.showLoading();
    await this.checkAuthState();
    this.setupEventListeners();
    this.hideLoading();
  }

  showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
  }

  async checkAuthState() {
    return new Promise((resolve) => {
      onAuthChange(async (user) => {
        if (user) {
          this.currentUser = user;
          await this.showDashboard();
        } else {
          this.showLogin();
        }
        resolve();
      });
    });
  }

  showLogin() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('dashboard-container').style.display = 'none';
  }

  async showDashboard() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'flex';
    await this.loadDashboardData();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin(e);
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await this.handleLogout();
      });
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.switchSection(section);
      });
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // View site button
    const viewSiteBtn = document.getElementById('view-site-btn');
    if (viewSiteBtn) {
      viewSiteBtn.addEventListener('click', () => {
        window.open('./index.html', '_blank');
      });
    }

    // Modal handlers
    this.setupModalHandlers();
    this.setupFormHandlers();
    this.setupUploadHandlers();
    this.setupProfileImageHandlers();
  }

  async handleLogin(e) {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');

    try {
      // Show loading state
      loginBtn.querySelector('.btn-text').style.display = 'none';
      loginBtn.querySelector('.btn-loading').style.display = 'inline-flex';
      loginBtn.disabled = true;
      loginError.style.display = 'none';

      await loginAdmin(email, password);
      this.showToast('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      loginError.textContent = 'Invalid credentials. Please try again.';
      loginError.style.display = 'block';
    } finally {
      // Reset button state
      loginBtn.querySelector('.btn-text').style.display = 'inline';
      loginBtn.querySelector('.btn-loading').style.display = 'none';
      loginBtn.disabled = false;
    }
  }

  async handleLogout() {
    try {
      await logoutAdmin();
      this.currentUser = null;
      this.showLogin();
      this.showToast('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');

    // Update page title
    const titles = {
      overview: 'Dashboard Overview',
      categories: 'Manage Categories',
      gallery: 'Gallery Management',
      services: 'Services & Pricing',
      orders: 'Client Orders',
      testimonials: 'Client Testimonials',
      content: 'Website Content',
      profile: 'Admin Profile',
      settings: 'Site Settings'
    };
    document.getElementById('page-title').textContent = titles[section] || section;

    this.currentSection = section;
    this.loadSectionData(section);
  }

  async loadDashboardData() {
    await this.loadSectionData('overview');
  }

  async loadSectionData(section) {
    try {
      switch (section) {
        case 'overview':
          await this.loadOverviewData();
          break;
        case 'categories':
          await this.loadCategories();
          break;
        case 'gallery':
          await this.loadGallery();
          break;
        case 'services':
          await this.loadServices();
          break;
        case 'orders':
          await this.loadOrders();
          break;
        case 'testimonials':
          await this.loadTestimonials();
          break;
        case 'content':
          await this.loadContent();
          break;
        case 'profile':
          await this.loadProfile();
          break;
        case 'settings':
          await this.loadSettings();
          break;
      }
    } catch (error) {
      console.error(`Error loading ${section} data:`, error);
    }
  }

  async loadOverviewData() {
    const [categories, gallery, orders, testimonials] = await Promise.all([
      FirebaseAPI.getCategories(),
      FirebaseAPI.getGalleryImages(),
      FirebaseAPI.getOrders(),
      FirebaseAPI.getTestimonials()
    ]);

    // Update stats
    document.getElementById('categories-count').textContent = categories.length;
    document.getElementById('gallery-count').textContent = gallery.length;
    document.getElementById('orders-count').textContent = orders.length;
    document.getElementById('testimonials-count').textContent = testimonials.length;

    // Update orders badge
    const newOrders = orders.filter(o => o.status === 'new').length;
    document.getElementById('orders-badge').textContent = newOrders;

    // Load recent orders
    this.displayRecentOrders(orders.slice(0, 5));
  }

  displayRecentOrders(orders) {
    const container = document.getElementById('recent-orders');
    if (!orders.length) {
      container.innerHTML = '<p class="text-muted">No recent orders</p>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border);">
        <div>
          <strong>${order.name}</strong><br>
          <small class="text-muted">${order.eventType} • ${order.date}</small>
        </div>
        <span class="status-badge status-${order.status}">${order.status}</span>
      </div>
    `).join('');
  }

  async loadCategories() {
    const categories = await FirebaseAPI.getCategories();
    this.displayCategories(categories);
    this.populateCategorySelects(categories);
  }

  displayCategories(categories) {
    const container = document.getElementById('categories-list');
    
    if (!categories.length) {
      container.innerHTML = '<p class="text-muted">No categories found. Add your first category!</p>';
      return;
    }

    container.innerHTML = `
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${categories.map(category => `
              <tr>
                <td><strong>${category.name}</strong></td>
                <td>${category.description || 'No description'}</td>
                <td>${category.order}</td>
                <td>
                  <span class="status-badge ${category.active ? 'status-confirmed' : 'status-cancelled'}">
                    ${category.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.editCategory('${category.id}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.deleteCategory('${category.id}')" style="margin-left: 8px;">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  populateCategorySelects(categories) {
    const selects = [
      document.getElementById('upload-category'),
      document.getElementById('gallery-category-filter')
    ];

    selects.forEach(select => {
      if (select) {
        // Save current value
        const currentValue = select.value;
        
        // Clear options (keep first option for some selects)
        if (select.id === 'gallery-category-filter') {
          select.innerHTML = '<option value="">All Categories</option>';
        } else {
          select.innerHTML = '<option value="">Choose category...</option>';
        }

        // Add category options
        categories.forEach(category => {
          if (category.active) {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
          }
        });

        // Restore previous value
        select.value = currentValue;
      }
    });
  }

  async loadGallery() {
    const categoryFilter = document.getElementById('gallery-category-filter').value;
    const gallery = await FirebaseAPI.getGalleryImages(categoryFilter || null);
    this.displayGallery(gallery);
  }

  displayGallery(images) {
    const container = document.getElementById('gallery-grid');
    
    if (!images.length) {
      container.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1; text-align: center;">No images found. Upload some images!</p>';
      return;
    }

    container.innerHTML = images.map(image => `
      <div class="gallery-item">
        <img src="${image.url}" alt="${image.alt || 'Gallery image'}" loading="lazy">
        <div class="gallery-actions">
          <button class="gallery-btn" onclick="window.adminDashboard.deleteGalleryImage('${image.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  async loadServices() {
    const [services, addons] = await Promise.all([
      FirebaseAPI.getServices(),
      FirebaseAPI.getAddons()
    ]);
    
    this.displayServices(services);
    this.displayAddons(addons);
  }

  displayServices(services) {
    const container = document.getElementById('services-list');
    
    if (!services.length) {
      container.innerHTML = '<p class="text-muted">No services found. Add your first service!</p>';
      return;
    }

    container.innerHTML = services.map(service => `
      <div class="service-item" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px;">
        <div>
          <h4>${service.name} ${service.tag ? `<span class="badge">${service.tag}</span>` : ''}</h4>
          <p class="text-muted" style="margin: 4px 0;">${service.description}</p>
          <strong>${this.formatPrice(service.price, service.currency)} ${service.unit ? `/ ${service.unit}` : ''}</strong>
        </div>
        <div>
          <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.editService('${service.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.deleteService('${service.id}')" style="margin-left: 8px;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  displayAddons(addons) {
    const container = document.getElementById('addons-list');
    
    if (!addons.length) {
      container.innerHTML = '<p class="text-muted">No add-ons found. Add your first add-on!</p>';
      return;
    }

    container.innerHTML = addons.map(addon => `
      <div class="addon-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px;">
        <div>
          <strong>${addon.name}</strong><br>
          <span class="text-primary">${this.formatPrice(addon.price, addon.currency)} ${addon.unit ? `/ ${addon.unit}` : ''}</span>
        </div>
        <div>
          <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.editAddon('${addon.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.deleteAddon('${addon.id}')" style="margin-left: 8px;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  async loadOrders() {
    const statusFilter = document.getElementById('orders-status-filter').value;
    let orders = await FirebaseAPI.getOrders();
    
    if (statusFilter) {
      orders = orders.filter(order => order.status === statusFilter);
    }

    this.displayOrders(orders);
  }

  displayOrders(orders) {
    const container = document.getElementById('orders-list');
    
    if (!orders.length) {
      container.innerHTML = '<p class="text-muted">No orders found.</p>';
      return;
    }

    container.innerHTML = `
      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Event</th>
              <th>Date</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>
                  <strong>${order.name}</strong><br>
                  <small class="text-muted">${order.email}</small>
                </td>
                <td>${order.eventType}</td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>
                  ${order.phone ? `<div>📞 ${order.phone}</div>` : ''}
                  ${order.address ? `<div>📍 ${order.address}</div>` : ''}
                </td>
                <td>
                  <select class="form-control" style="width: auto; padding: 4px 8px; font-size: 12px;" 
                          onchange="window.adminDashboard.updateOrderStatus('${order.id}', this.value)">
                    <option value="new" ${order.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="contacted" ${order.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.viewOrderDetails('${order.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async loadTestimonials() {
    const testimonials = await FirebaseAPI.getTestimonials();
    this.displayTestimonials(testimonials);
  }

  displayTestimonials(testimonials) {
    const container = document.getElementById('testimonials-list');
    
    if (!testimonials.length) {
      container.innerHTML = '<p class="text-muted">No testimonials found. Add your first testimonial!</p>';
      return;
    }

    container.innerHTML = testimonials.map(testimonial => `
      <div class="testimonial-item" style="padding: 16px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px;">
        <blockquote style="font-style: italic; margin-bottom: 8px;">
          "${testimonial.text}"
        </blockquote>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>— ${testimonial.author}</strong>
          <div>
            <span class="status-badge ${testimonial.active ? 'status-confirmed' : 'status-cancelled'}">
              ${testimonial.active ? 'Active' : 'Inactive'}
            </span>
            <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.editTestimonial('${testimonial.id}')" style="margin-left: 8px;">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-secondary" onclick="window.adminDashboard.deleteTestimonial('${testimonial.id}')" style="margin-left: 8px;">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  async loadContent() {
    const settings = await FirebaseAPI.getSiteSettings();
    const founders = await FirebaseAPI.getFoundersSettings();
    
    if (settings) {
      // Populate hero content form
      document.getElementById('hero-main-title').value = settings.heroTitle || '';
      document.getElementById('hero-subtitle').value = settings.heroSubtitle || '';
      
      // Populate about content form
      document.getElementById('about-main-text').value = settings.aboutText || '';
    }
    
    if (founders) {
      // Populate founders content form
      document.getElementById('founders-title').value = founders.title || '';
      document.getElementById('founders-description').value = founders.description || '';
    }
  }

  async loadSettings() {
    const settings = await FirebaseAPI.getSiteSettings();
    if (settings) {
      // Populate general settings form
      document.getElementById('site-name').value = settings.siteName || '';
      document.getElementById('site-email').value = settings.email || '';
      document.getElementById('site-phone').value = settings.phone || '';
      document.getElementById('site-theme').value = settings.theme || 'vibrant';
      document.getElementById('hero-title').value = settings.heroTitle || '';
      document.getElementById('hero-subtitle').value = settings.heroSubtitle || '';
      document.getElementById('about-text').value = settings.aboutText || '';

      // Populate social links
      if (settings.socialLinks) {
        document.getElementById('instagram-link').value = settings.socialLinks.instagram || '';
        document.getElementById('facebook-link').value = settings.socialLinks.facebook || '';
        document.getElementById('whatsapp-link').value = settings.socialLinks.whatsapp || '';
      }
    }
  }

  // Modal handlers
  setupModalHandlers() {
    // Modal close handlers
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });

    // Category modal
    document.getElementById('add-category-btn').addEventListener('click', () => {
      this.openCategoryModal();
    });

    // Service modal
    document.getElementById('add-service-btn').addEventListener('click', () => {
      this.openServiceModal();
    });

    // Addon modal (reuse service modal)
    document.getElementById('add-addon-btn').addEventListener('click', () => {
      this.openServiceModal(true);
    });

    // Testimonial modal
    document.getElementById('add-testimonial-btn').addEventListener('click', () => {
      this.openTestimonialModal();
    });

    // Upload modal
    document.getElementById('upload-images-btn').addEventListener('click', () => {
      this.openUploadModal();
    });

    // Gallery category filter
    document.getElementById('gallery-category-filter').addEventListener('change', () => {
      this.loadGallery();
    });

    // Orders status filter
    document.getElementById('orders-status-filter').addEventListener('change', () => {
      this.loadOrders();
    });
  }

  setupFormHandlers() {
    // Category form
    document.getElementById('category-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveCategoryForm(e);
    });

    // Service form
    document.getElementById('service-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveServiceForm(e);
    });

    // Testimonial form
    document.getElementById('testimonial-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveTestimonialForm(e);
    });

    // Settings forms
    document.getElementById('general-settings-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveGeneralSettings(e);
    });

    document.getElementById('social-settings-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveSocialSettings(e);
    });

    // Content management forms
    document.getElementById('hero-content-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveHeroContent(e);
    });

    document.getElementById('about-content-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveAboutContent(e);
    });

    document.getElementById('founders-content-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveFoundersContent(e);
    });

    // Profile form
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveProfile(e);
    });
  }

  setupUploadHandlers() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-files');
    const uploadBtn = document.getElementById('upload-images');

    // Browse files button
    browseBtn.addEventListener('click', () => {
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      this.selectedFiles = Array.from(e.target.files);
      this.updateUploadUI();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      this.selectedFiles = Array.from(e.dataTransfer.files);
      this.updateUploadUI();
    });

    // Upload button
    uploadBtn.addEventListener('click', async () => {
      await this.uploadImages();
    });
  }

  updateUploadUI() {
    const uploadContent = document.querySelector('.upload-content h4');
    if (this.selectedFiles.length > 0) {
      uploadContent.textContent = `${this.selectedFiles.length} file(s) selected`;
    } else {
      uploadContent.textContent = 'Drag & drop images here';
    }
  }

  // Modal methods
  openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
    this.editingItem = null;
  }

  openCategoryModal(categoryId = null) {
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const form = document.getElementById('category-form');

    if (categoryId) {
      title.textContent = 'Edit Category';
      // Load category data
      this.loadCategoryForEdit(categoryId);
    } else {
      title.textContent = 'Add Category';
      form.reset();
      // Set default order
      FirebaseAPI.getCategories().then(categories => {
        document.getElementById('category-order').value = categories.length + 1;
      });
    }

    this.editingItem = categoryId;
    this.openModal('category-modal');
  }

  openServiceModal(isAddon = false, serviceId = null) {
    const modal = document.getElementById('service-modal');
    const title = document.getElementById('service-modal-title');
    const form = document.getElementById('service-form');

    if (serviceId) {
      title.textContent = isAddon ? 'Edit Add-on' : 'Edit Service';
      this.loadServiceForEdit(serviceId, isAddon);
    } else {
      title.textContent = isAddon ? 'Add Add-on' : 'Add Service';
      form.reset();
      document.getElementById('service-currency').value = 'PKR';
      
      // Set default order
      const loadItems = isAddon ? FirebaseAPI.getAddons() : FirebaseAPI.getServices();
      loadItems.then(items => {
        document.getElementById('service-order').value = items.length + 1;
      });
    }

    this.editingItem = serviceId;
    this.isEditingAddon = isAddon;
    this.openModal('service-modal');
  }

  openTestimonialModal(testimonialId = null) {
    const modal = document.getElementById('testimonial-modal');
    const title = document.getElementById('testimonial-modal-title');
    const form = document.getElementById('testimonial-form');

    if (testimonialId) {
      title.textContent = 'Edit Testimonial';
      this.loadTestimonialForEdit(testimonialId);
    } else {
      title.textContent = 'Add Testimonial';
      form.reset();
      // Set default order
      FirebaseAPI.getTestimonials().then(testimonials => {
        document.getElementById('testimonial-order').value = testimonials.length + 1;
      });
    }

    this.editingItem = testimonialId;
    this.openModal('testimonial-modal');
  }

  openUploadModal() {
    this.selectedFiles = [];
    this.updateUploadUI();
    document.getElementById('file-input').value = '';
    this.openModal('upload-modal');
  }

  // Form save methods
  async saveCategoryForm(e) {
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      order: parseInt(formData.get('order')),
      active: formData.get('active') === 'on'
    };

    try {
      if (this.editingItem) {
        await FirebaseAPI.updateCategory(this.editingItem, data);
        this.showToast('Category updated successfully!');
      } else {
        data.id = data.name.toLowerCase().replace(/\s+/g, '-');
        await FirebaseAPI.addCategory(data);
        this.showToast('Category added successfully!');
      }

      this.closeModal('category-modal');
      await this.loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      this.showToast('Error saving category', 'error');
    }
  }

  async saveServiceForm(e) {
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      currency: formData.get('currency'),
      unit: formData.get('unit'),
      tag: formData.get('tag'),
      order: parseInt(formData.get('order')),
      active: formData.get('active') === 'on'
    };

    try {
      const isAddon = this.isEditingAddon;
      
      if (this.editingItem) {
        if (isAddon) {
          await FirebaseAPI.updateAddon(this.editingItem, data);
        } else {
          await FirebaseAPI.updateService(this.editingItem, data);
        }
        this.showToast(`${isAddon ? 'Add-on' : 'Service'} updated successfully!`);
      } else {
        if (isAddon) {
          await FirebaseAPI.addAddon(data);
        } else {
          await FirebaseAPI.addService(data);
        }
        this.showToast(`${isAddon ? 'Add-on' : 'Service'} added successfully!`);
      }

      this.closeModal('service-modal');
      await this.loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      this.showToast('Error saving service', 'error');
    }
  }

  async saveTestimonialForm(e) {
    const formData = new FormData(e.target);
    const data = {
      text: formData.get('text'),
      author: formData.get('author'),
      order: parseInt(formData.get('order')),
      active: formData.get('active') === 'on',
      published: formData.get('active') === 'on'
    };

    try {
      if (this.editingItem) {
        await FirebaseAPI.updateTestimonial(this.editingItem, data);
        this.showToast('Testimonial updated successfully!');
      } else {
        await FirebaseAPI.addTestimonial(data);
        this.showToast('Testimonial added successfully!');
      }

      this.closeModal('testimonial-modal');
      await this.loadTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      this.showToast('Error saving testimonial', 'error');
    }
  }

  async saveGeneralSettings(e) {
    const formData = new FormData(e.target);
    const data = {
      siteName: formData.get('siteName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      theme: formData.get('theme'),
      heroTitle: formData.get('heroTitle'),
      heroSubtitle: formData.get('heroSubtitle'),
      aboutText: formData.get('aboutText')
    };

    try {
      await FirebaseAPI.updateSiteSettings(data);
      this.showToast('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showToast('Error saving settings', 'error');
    }
  }

  async saveSocialSettings(e) {
    const formData = new FormData(e.target);
    const socialLinks = {
      instagram: formData.get('instagram'),
      facebook: formData.get('facebook'),
      whatsapp: formData.get('whatsapp')
    };

    try {
      await FirebaseAPI.updateSiteSettings({ socialLinks });
      this.showToast('Social links updated successfully!');
    } catch (error) {
      console.error('Error saving social links:', error);
      this.showToast('Error saving social links', 'error');
    }
  }

  // Content management save methods
  async saveHeroContent(e) {
    const formData = new FormData(e.target);
    const data = {
      heroTitle: formData.get('heroTitle'),
      heroSubtitle: formData.get('heroSubtitle')
    };

    try {
      await FirebaseAPI.updateSiteSettings(data);
      this.showToast('Hero section updated successfully!');
    } catch (error) {
      console.error('Error saving hero content:', error);
      this.showToast('Error saving hero content', 'error');
    }
  }

  async saveAboutContent(e) {
    const formData = new FormData(e.target);
    const data = {
      aboutText: formData.get('aboutText')
    };

    try {
      await FirebaseAPI.updateSiteSettings(data);
      this.showToast('About section updated successfully!');
    } catch (error) {
      console.error('Error saving about content:', error);
      this.showToast('Error saving about content', 'error');
    }
  }

  async saveFoundersContent(e) {
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('foundersTitle'),
      description: formData.get('foundersDescription')
    };

    try {
      await FirebaseAPI.updateFoundersSettings(data);
      this.showToast('Founders section updated successfully!');
    } catch (error) {
      console.error('Error saving founders content:', error);
      this.showToast('Error saving founders content', 'error');
    }
  }

  // Upload methods
  async uploadImages() {
    const categoryId = document.getElementById('upload-category').value;
    
    if (!categoryId) {
      this.showToast('Please select a category', 'error');
      return;
    }

    if (!this.selectedFiles.length) {
      this.showToast('Please select images to upload', 'error');
      return;
    }

    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.querySelector('.progress-fill');
    const uploadBtn = document.getElementById('upload-images');

    try {
      uploadBtn.disabled = true;
      uploadProgress.style.display = 'block';

      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];

        const progress = ((i + 1) / this.selectedFiles.length) * 100;
        progressFill.style.width = `${progress}%`;

        // Upload to Cloudinary using unsigned preset
        const imageUrl = await this.uploadToCloudinary(file, categoryId);
        
        // Save to Firestore
        await FirebaseAPI.addGalleryImage({
          categoryId,
          url: imageUrl,
          alt: `${categoryId} image`,
          order: Date.now() + i, // Simple ordering
          published: true
        });
      }

      this.showToast(`${this.selectedFiles.length} images uploaded successfully!`);
      this.closeModal('upload-modal');
      await this.loadGallery();
    } catch (error) {
      console.error('Error uploading images:', error);
      this.showToast('Error uploading images', 'error');
    } finally {
      uploadBtn.disabled = false;
      uploadProgress.style.display = 'none';
      progressFill.style.width = '0%';
    }
  }

  // Unsigned upload to Cloudinary with an upload preset
  async uploadToCloudinary(file, categoryId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', `twinfinity/${categoryId}`);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  }

  // Edit methods
  async loadCategoryForEdit(categoryId) {
    const categories = await FirebaseAPI.getCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (category) {
      document.getElementById('category-name').value = category.name;
      document.getElementById('category-description').value = category.description || '';
      document.getElementById('category-order').value = category.order;
      document.getElementById('category-active').checked = category.active;
    }
  }

  async loadServiceForEdit(serviceId, isAddon) {
    const items = isAddon ? await FirebaseAPI.getAddons() : await FirebaseAPI.getServices();
    const item = items.find(i => i.id === serviceId);
    
    if (item) {
      document.getElementById('service-name').value = item.name;
      document.getElementById('service-description').value = item.description || '';
      document.getElementById('service-price').value = item.price;
      document.getElementById('service-currency').value = item.currency;
      document.getElementById('service-unit').value = item.unit || '';
      document.getElementById('service-tag').value = item.tag || '';
      document.getElementById('service-order').value = item.order;
      document.getElementById('service-active').checked = item.active;
    }
  }

  async loadTestimonialForEdit(testimonialId) {
    const testimonials = await FirebaseAPI.getTestimonials();
    const testimonial = testimonials.find(t => t.id === testimonialId);
    
    if (testimonial) {
      document.getElementById('testimonial-text').value = testimonial.text;
      document.getElementById('testimonial-author').value = testimonial.author;
      document.getElementById('testimonial-order').value = testimonial.order;
      document.getElementById('testimonial-active').checked = testimonial.active;
    }
  }

  // Delete methods
  async deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category? This will also delete all images in this category.')) {
      try {
        await FirebaseAPI.deleteCategory(categoryId);
        // Also delete associated gallery images
        const images = await FirebaseAPI.getGalleryImages(categoryId);
        for (const image of images) {
          await FirebaseAPI.deleteGalleryImage(image.id);
        }
        
        this.showToast('Category deleted successfully!');
        await this.loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        this.showToast('Error deleting category', 'error');
      }
    }
  }

  async deleteService(serviceId) {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await FirebaseAPI.deleteService(serviceId);
        this.showToast('Service deleted successfully!');
        await this.loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        this.showToast('Error deleting service', 'error');
      }
    }
  }

  async deleteAddon(addonId) {
    if (confirm('Are you sure you want to delete this add-on?')) {
      try {
        await FirebaseAPI.deleteAddon(addonId);
        this.showToast('Add-on deleted successfully!');
        await this.loadServices();
      } catch (error) {
        console.error('Error deleting add-on:', error);
        this.showToast('Error deleting add-on', 'error');
      }
    }
  }

  async deleteTestimonial(testimonialId) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await FirebaseAPI.deleteTestimonial(testimonialId);
        this.showToast('Testimonial deleted successfully!');
        await this.loadTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        this.showToast('Error deleting testimonial', 'error');
      }
    }
  }

  async deleteGalleryImage(imageId) {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await FirebaseAPI.deleteGalleryImage(imageId);
        this.showToast('Image deleted successfully!');
        await this.loadGallery();
      } catch (error) {
        console.error('Error deleting image:', error);
        this.showToast('Error deleting image', 'error');
      }
    }
  }

  // Edit methods for external calls
  async editCategory(categoryId) {
    this.openCategoryModal(categoryId);
  }

  async editService(serviceId) {
    this.openServiceModal(false, serviceId);
  }

  async editAddon(addonId) {
    this.openServiceModal(true, addonId);
  }

  async editTestimonial(testimonialId) {
    this.openTestimonialModal(testimonialId);
  }

  // Order status update
  async updateOrderStatus(orderId, status) {
    try {
      await FirebaseAPI.updateOrderStatus(orderId, status);
      this.showToast('Order status updated!');
      await this.loadOverviewData(); // Refresh stats
    } catch (error) {
      console.error('Error updating order status:', error);
      this.showToast('Error updating order status', 'error');
    }
  }

  async viewOrderDetails(orderId) {
    // This could open a modal with full order details
    // For now, just show an alert
    const orders = await FirebaseAPI.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      const details = `
Order Details:
Name: ${order.name}
Email: ${order.email}
Phone: ${order.phone || 'Not provided'}
Address: ${order.address || 'Not provided'}
Event Type: ${order.eventType}
Event Date: ${new Date(order.date).toLocaleDateString()}
Message: ${order.message || 'No message'}
Status: ${order.status}
Submitted: ${new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
      `;
      alert(details);
    }
  }

  // Profile Management
  async loadProfile() {
    try {
      const profile = await FirebaseAPI.getAdminProfile();
      this.displayProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      this.displayProfile(null);
    }
  }

  displayProfile(profile) {
    const nameEl = document.getElementById('admin-name');
    const bioEl = document.getElementById('admin-bio');
    const expEl = document.getElementById('admin-experience');
    const locEl = document.getElementById('admin-location');
    const specEl = document.getElementById('admin-specialties');
    const imgEl = document.getElementById('profile-image-preview');
    const placeholder = document.getElementById('profile-placeholder');
    const removeBtn = document.getElementById('remove-profile-image');

    if (!profile) {
      if (imgEl) { imgEl.style.display = 'none'; imgEl.src = ''; }
      if (placeholder) placeholder.style.display = 'flex';
      if (removeBtn) removeBtn.style.display = 'none';
      return;
    }

    if (nameEl) nameEl.value = profile.name || '';
    if (bioEl) bioEl.value = profile.bio || '';
    if (expEl) expEl.value = profile.experience || '';
    if (locEl) locEl.value = profile.location || '';
    if (specEl) specEl.value = profile.specialties || '';

    if (imgEl && placeholder && removeBtn) {
      if (profile.photo) {
        imgEl.src = profile.photo;
        imgEl.style.display = 'block';
        placeholder.style.display = 'none';
        removeBtn.style.display = 'inline-flex';
      } else {
        imgEl.src = '';
        imgEl.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
      }
    }
  }

  async saveProfile(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      bio: formData.get('bio'),
      experience: formData.get('experience'),
      location: formData.get('location'),
      specialties: formData.get('specialties')
    };

    try {
      // Handle profile photo upload if present (from #profile-image-input)
      const inputEl = document.getElementById('profile-image-input');
      const photoFile = inputEl?.files?.[0];
      if (photoFile) {
        const photoUrl = await this.uploadProfilePhoto(photoFile);
        data.photo = photoUrl;
      }

      await FirebaseAPI.updateAdminProfile(data);
      this.showToast('Profile updated successfully!');
      await this.loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      this.showToast('Error saving profile', 'error');
    }
  }

  async uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'twinfinity/admin');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload profile photo to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  }

  async removeProfilePhoto() {
    if (confirm('Are you sure you want to remove your profile photo?')) {
      try {
        await FirebaseAPI.removeAdminProfilePhoto();
        this.showToast('Profile photo removed successfully!');
        await this.loadProfile();
      } catch (error) {
        console.error('Error removing profile photo:', error);
        this.showToast('Error removing profile photo', 'error');
      }
    }
  }

  setupProfileImageHandlers() {
    const uploadBtn = document.getElementById('upload-profile-image');
    const removeBtn = document.getElementById('remove-profile-image');
    const inputEl = document.getElementById('profile-image-input');
    const imgEl = document.getElementById('profile-image-preview');
    const placeholder = document.getElementById('profile-placeholder');

    if (uploadBtn && inputEl) {
      uploadBtn.addEventListener('click', () => inputEl.click());
    }
    if (inputEl && imgEl && placeholder) {
      inputEl.addEventListener('change', () => {
        const file = inputEl.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          imgEl.src = e.target.result;
          imgEl.style.display = 'block';
          placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
      });
    }
    if (removeBtn) {
      removeBtn.addEventListener('click', async () => {
        try {
          await FirebaseAPI.removeAdminProfilePhoto();
          if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
          if (placeholder) placeholder.style.display = 'flex';
          removeBtn.style.display = 'none';
          this.showToast('Profile photo removed successfully!');
        } catch (err) {
          console.error('Remove profile photo error:', err);
          this.showToast('Error removing profile photo', 'error');
        }
      });
    }
  }

  // Utility methods
  formatPrice(amount, currency = 'PKR') {
    try {
      return new Intl.NumberFormat(undefined, { 
        style: 'currency', 
        currency: currency, 
        maximumFractionDigits: 0 
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''} show`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Initialize dashboard
const adminDashboard = new AdminDashboard();

// Make it globally available for onclick handlers
window.adminDashboard = adminDashboard;