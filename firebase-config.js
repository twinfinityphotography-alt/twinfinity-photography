// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { FallbackStorage } from './fallback-storage.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize fallback storage
const fallbackStorage = new FallbackStorage();
let useFirebase = true;

// Test Firebase connection on initialization
let firebaseReady = false;

// Cloudinary configuration used client-side only for building delivery URLs (no secrets here)
const CLOUDINARY_CONFIG = {
  cloudName: 'dmodvacdz',
  uploadPreset: 'twinfinity_photos'
};

// Initialize default collections when admin first logs in
async function initializeDefaultCollections() {
  try {
    // Check if collections already exist
    const settingsRef = doc(db, 'settings', 'site');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      console.log('Initializing default collections...');
      
      // Site Settings
      await setDoc(settingsRef, {
        siteName: 'Twinfinity Photography',
        email: 'twinfinityphotography@gmail.com',
        phone: '923175446886',
        heroTitle: 'Timeless stories, beautifully told',
        heroSubtitle: 'Elegant wedding, event, and portrait photography that feels refined, modern, and unforgettable.',
        aboutText: 'We are Twinfinity Photography — storytellers dedicated to preserving your most meaningful moments through timeless imagery.',
        theme: 'vibrant',
        socialLinks: {
          instagram: 'https://www.instagram.com/twinfinitycaptures?igsh=NmpkbWd1czlkeWtw',
          facebook: 'https://facebook.com/yourprofile',
          whatsapp: 'https://wa.me/923175446886'
        },
        createdAt: new Date()
      });

      // Default Categories
      const categories = [
        { id: 'wedding', name: 'Wedding', description: 'Beautiful wedding photography', order: 1, active: true },
        { id: 'event', name: 'Event', description: 'Corporate and social events', order: 2, active: true },
        { id: 'portrait', name: 'Portrait', description: 'Professional portrait sessions', order: 3, active: true }
      ];

      for (const category of categories) {
        await setDoc(doc(db, 'categories', category.id), {
          ...category,
          createdAt: new Date()
        });
      }

      // Default Services
      const services = [
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
      ];

      for (const service of services) {
        await setDoc(doc(db, 'services', service.id), {
          ...service,
          createdAt: new Date()
        });
      }

      // Default Add-ons
      const addons = [
        {
          id: 'album-basic',
          name: 'Photo Album (Basic)',
          price: 12000,
          currency: 'PKR',
          unit: 'starting',
          active: true,
          order: 1
        },
        {
          id: 'album-premium',
          name: 'Photo Album (Premium 12x36)',
          price: 18000,
          currency: 'PKR',
          unit: 'starting',
          active: true,
          order: 2
        },
        {
          id: 'drone',
          name: 'Drone Coverage',
          price: 10000,
          currency: 'PKR',
          unit: 'per event',
          active: true,
          order: 3
        }
      ];

      for (const addon of addons) {
        await setDoc(doc(db, 'addons', addon.id), {
          ...addon,
          createdAt: new Date()
        });
      }

      // Default Testimonials
      const testimonials = [
        {
          id: 'testimonial1',
          text: 'They captured our wedding beautifully — every tiny moment! Highly recommended.',
          author: 'Ayesha & Hamza',
          active: true,
          published: true,
          order: 1
        },
        {
          id: 'testimonial2',
          text: 'Professional team, punctual, and incredible results for our corporate gala.',
          author: 'NEXA Corp',
          active: true,
          published: true,
          order: 2
        },
        {
          id: 'testimonial3',
          text: 'Our pre-wedding shoot felt effortless and the photos look like magazine covers.',
          author: 'Sara & Daniyal',
          active: true,
          published: true,
          order: 3
        }
      ];

      for (const testimonial of testimonials) {
        await setDoc(doc(db, 'testimonials', testimonial.id), {
          ...testimonial,
          createdAt: new Date()
        });
      }

      // Founders info (site copy for founders section)
      await setDoc(doc(db, 'settings', 'founders'), {
        count: 2,
        title: 'Meet the Sisters behind Twinfinity',
        description: 'Two creative storytellers, dedicated to capturing emotion with elegance and detail. From intimate portraits to grand celebrations, their vision blends artistry with timeless style.',
        createdAt: new Date()
      });

      // Admin profile default doc (used for founders photo/content if desired)
      await setDoc(doc(db, 'settings', 'adminProfile'), {
        name: 'Twinfinity Team',
        bio: 'Professional photography team specializing in weddings, events, and portraits.',
        experience: '5+ years',
        location: 'Pakistan',
        specialties: 'Weddings, Events, Portraits',
        photo: null,
        createdAt: new Date()
      });

      console.log('Default collections initialized successfully!');
    }
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

// Admin authentication
async function loginAdmin(email, password) {
  // Check if this is the correct admin credentials
  if (email === 'admin@gmail.com' && password === 'admin123') {
    try {
      // Require real Firebase authentication (no silent fallback)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Admin logged in successfully with Firebase');
      await initializeDefaultCollections();
      firebaseReady = true;
      useFirebase = true;
      return userCredential.user;
    } catch (error) {
      console.error('Firebase authentication failed:', error);
      throw new Error('Login failed. Please ensure this domain is authorized in Firebase Auth and try again.');
    }
  } else {
    throw new Error('Invalid credentials');
  }
}

async function logoutAdmin() {
  try {
    await signOut(auth);
    console.log('Admin logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Check authentication state
function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Test Firestore connection
async function testFirestoreConnection() {
  try {
    // Try to read from settings - if this fails, we have a connection issue
    const testDoc = await getDoc(doc(db, 'settings', 'site'));
    console.log('Firestore connection test successful');
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    // If connection fails, we might need to initialize with test mode
    return false;
  }
}

// Database operations with Firebase/Fallback
const FirebaseAPI = {
  // Helper function to handle Firebase calls with fallback
  async _callWithFallback(firebaseMethod, fallbackMethod, ...args) {
    // Enforce Firebase in production: do not fallback silently
    return await firebaseMethod(...args);
  },

  // Categories
  async getCategories() {
    return this._callWithFallback(
      async () => {
        const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('order')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      () => fallbackStorage.getCategories()
    );
  },

  async addCategory(data) {
    return this._callWithFallback(
      () => addDoc(collection(db, 'categories'), { ...data, createdAt: new Date() }),
      () => fallbackStorage.addCategory(data)
    );
  },

  async updateCategory(id, data) {
    return this._callWithFallback(
      () => updateDoc(doc(db, 'categories', id), { ...data, updatedAt: new Date() }),
      () => fallbackStorage.updateCategory(id, data)
    );
  },

  async deleteCategory(id) {
    return this._callWithFallback(
      () => deleteDoc(doc(db, 'categories', id)),
      () => fallbackStorage.deleteCategory(id)
    );
  },

  // Services
  async getServices() {
    return this._callWithFallback(
      async () => {
        const snapshot = await getDocs(query(collection(db, 'services'), orderBy('order')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      () => fallbackStorage.getServices()
    );
  },

  async addService(data) {
    return this._callWithFallback(
      () => addDoc(collection(db, 'services'), { ...data, createdAt: new Date() }),
      () => fallbackStorage.addService(data)
    );
  },

  async updateService(id, data) {
    return this._callWithFallback(
      () => updateDoc(doc(db, 'services', id), { ...data, updatedAt: new Date() }),
      () => fallbackStorage.updateService(id, data)
    );
  },

  async deleteService(id) {
    return this._callWithFallback(
      () => deleteDoc(doc(db, 'services', id)),
      () => fallbackStorage.deleteService(id)
    );
  },

  // Add-ons
  async getAddons() {
    return this._callWithFallback(
      async () => {
        const snapshot = await getDocs(query(collection(db, 'addons'), orderBy('order')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      () => fallbackStorage.getAddons()
    );
  },

  async addAddon(data) {
    return this._callWithFallback(
      () => addDoc(collection(db, 'addons'), { ...data, createdAt: new Date() }),
      () => fallbackStorage.addAddon(data)
    );
  },

  async updateAddon(id, data) {
    return this._callWithFallback(
      () => updateDoc(doc(db, 'addons', id), { ...data, updatedAt: new Date() }),
      () => fallbackStorage.updateAddon(id, data)
    );
  },

  async deleteAddon(id) {
    return this._callWithFallback(
      () => deleteDoc(doc(db, 'addons', id)),
      () => fallbackStorage.deleteAddon(id)
    );
  },

  // Gallery Images
  async getGalleryImages(categoryId = null) {
    return this._callWithFallback(
      async () => {
        let q = collection(db, 'gallery');
        if (categoryId) {
          q = query(q, where('categoryId', '==', categoryId), orderBy('order'));
        } else {
          q = query(q, orderBy('categoryId'), orderBy('order'));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      () => fallbackStorage.getGalleryImages(categoryId)
    );
  },

  async addGalleryImage(data) {
    return this._callWithFallback(
      () => addDoc(collection(db, 'gallery'), { ...data, createdAt: new Date() }),
      () => fallbackStorage.addGalleryImage(data)
    );
  },

  async deleteGalleryImage(id) {
    return this._callWithFallback(
      () => deleteDoc(doc(db, 'gallery', id)),
      () => fallbackStorage.deleteGalleryImage(id)
    );
  },

  // Orders
  async getOrders() {
    return this._callWithFallback(
      async () => {
        const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      () => fallbackStorage.getOrders()
    );
  },

  async addOrder(data) {
    return this._callWithFallback(
      () => addDoc(collection(db, 'orders'), { ...data, createdAt: new Date(), status: 'new' }),
      () => fallbackStorage.addOrder(data)
    );
  },

  async updateOrderStatus(id, status, notes = '') {
    return this._callWithFallback(
      () => updateDoc(doc(db, 'orders', id), { status, notes, updatedAt: new Date() }),
      () => fallbackStorage.updateOrderStatus(id, status, notes)
    );
  },

  // Settings
  async getSiteSettings() {
    return this._callWithFallback(
      async () => {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
      },
      () => fallbackStorage.getSiteSettings()
    );
  },

  async updateSiteSettings(data) {
    return this._callWithFallback(
      () => updateDoc(doc(db, 'settings', 'site'), { ...data, updatedAt: new Date() }),
      () => fallbackStorage.updateSiteSettings(data)
    );
  },

  // Admin Profile
  async getAdminProfile() {
    return this._callWithFallback(
      async () => {
        const docRef = doc(db, 'settings', 'adminProfile');
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
      },
      () => fallbackStorage.getAdminProfile()
    );
  },

  async updateAdminProfile(data) {
    return this._callWithFallback(
      () => updateDoc(doc(db, 'settings', 'adminProfile'), { ...data, updatedAt: new Date() }),
      () => fallbackStorage.updateAdminProfile(data)
    );
  },

  async removeAdminProfilePhoto() {
    return this._callWithFallback(
      () => updateDoc(doc(db, 'settings', 'adminProfile'), { photo: null, updatedAt: new Date() }),
      () => fallbackStorage.removeAdminProfilePhoto()
    );
  },

  // Testimonials
  async getTestimonials() {
    return this._callWithFallback(
      async () => {
        const snapshot = await getDocs(query(collection(db, 'testimonials'), orderBy('order')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      () => fallbackStorage.getTestimonials()
    );
  },

  async addTestimonial(data) {
    return this._callWithFallback(
      () => addDoc(collection(db, 'testimonials'), { ...data, createdAt: new Date() }),
      () => fallbackStorage.addTestimonial(data)
    );
  },

  async updateTestimonial(id, data) {
    return this._callWithFallback(
      () => updateDoc(doc(db, 'testimonials', id), { ...data, updatedAt: new Date() }),
      () => fallbackStorage.updateTestimonial(id, data)
    );
  },

  async deleteTestimonial(id) {
    return this._callWithFallback(
      () => deleteDoc(doc(db, 'testimonials', id)),
      () => fallbackStorage.deleteTestimonial(id)
    );
  }
};

// Export functions and objects
export {
  auth,
  db,
  loginAdmin,
  logoutAdmin,
  onAuthChange,
  FirebaseAPI,
  CLOUDINARY_CONFIG,
  initializeDefaultCollections
};
