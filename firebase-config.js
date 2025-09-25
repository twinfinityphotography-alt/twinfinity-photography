// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: 'dmodvacdz',
  apiKey: '978584274776188',
  apiSecret: '_T87k_0TinGCvf7MN8csLL8Jpw0',
  uploadPreset: 'twinfinity_photos' // We'll create this preset
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
          order: 1
        },
        {
          id: 'testimonial2',
          text: 'Professional team, punctual, and incredible results for our corporate gala.',
          author: 'NEXA Corp',
          active: true,
          order: 2
        },
        {
          id: 'testimonial3',
          text: 'Our pre-wedding shoot felt effortless and the photos look like magazine covers.',
          author: 'Sara & Daniyal',
          active: true,
          order: 3
        }
      ];

      for (const testimonial of testimonials) {
        await setDoc(doc(db, 'testimonials', testimonial.id), {
          ...testimonial,
          createdAt: new Date()
        });
      }

      // Founders info
      await setDoc(doc(db, 'settings', 'founders'), {
        count: 2,
        title: 'Meet the Sisters behind Twinfinity',
        description: 'Two creative storytellers, dedicated to capturing emotion with elegance and detail. From intimate portraits to grand celebrations, their vision blends artistry with timeless style.',
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
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Admin logged in successfully');
    await initializeDefaultCollections(); // Initialize collections on first login
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
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

// Database operations
const FirebaseAPI = {
  // Categories
  async getCategories() {
    const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('order')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addCategory(data) {
    return await addDoc(collection(db, 'categories'), {
      ...data,
      createdAt: new Date()
    });
  },

  async updateCategory(id, data) {
    return await updateDoc(doc(db, 'categories', id), {
      ...data,
      updatedAt: new Date()
    });
  },

  async deleteCategory(id) {
    return await deleteDoc(doc(db, 'categories', id));
  },

  // Services
  async getServices() {
    const snapshot = await getDocs(query(collection(db, 'services'), orderBy('order')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addService(data) {
    return await addDoc(collection(db, 'services'), {
      ...data,
      createdAt: new Date()
    });
  },

  async updateService(id, data) {
    return await updateDoc(doc(db, 'services', id), {
      ...data,
      updatedAt: new Date()
    });
  },

  async deleteService(id) {
    return await deleteDoc(doc(db, 'services', id));
  },

  // Add-ons
  async getAddons() {
    const snapshot = await getDocs(query(collection(db, 'addons'), orderBy('order')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addAddon(data) {
    return await addDoc(collection(db, 'addons'), {
      ...data,
      createdAt: new Date()
    });
  },

  async updateAddon(id, data) {
    return await updateDoc(doc(db, 'addons', id), {
      ...data,
      updatedAt: new Date()
    });
  },

  async deleteAddon(id) {
    return await deleteDoc(doc(db, 'addons', id));
  },

  // Gallery Images
  async getGalleryImages(categoryId = null) {
    let q = collection(db, 'gallery');
    if (categoryId) {
      q = query(q, where('categoryId', '==', categoryId), orderBy('order'));
    } else {
      q = query(q, orderBy('categoryId'), orderBy('order'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addGalleryImage(data) {
    return await addDoc(collection(db, 'gallery'), {
      ...data,
      createdAt: new Date()
    });
  },

  async updateGalleryImage(id, data) {
    return await updateDoc(doc(db, 'gallery', id), {
      ...data,
      updatedAt: new Date()
    });
  },

  async deleteGalleryImage(id) {
    return await deleteDoc(doc(db, 'gallery', id));
  },

  // Orders
  async getOrders() {
    const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addOrder(data) {
    return await addDoc(collection(db, 'orders'), {
      ...data,
      createdAt: new Date(),
      status: 'new'
    });
  },

  async updateOrderStatus(id, status, notes = '') {
    return await updateDoc(doc(db, 'orders', id), {
      status,
      notes,
      updatedAt: new Date()
    });
  },

  // Settings
  async getSiteSettings() {
    const docRef = doc(db, 'settings', 'site');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },

  async updateSiteSettings(data) {
    return await updateDoc(doc(db, 'settings', 'site'), {
      ...data,
      updatedAt: new Date()
    });
  },

  // Testimonials
  async getTestimonials() {
    const snapshot = await getDocs(query(collection(db, 'testimonials'), orderBy('order')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addTestimonial(data) {
    return await addDoc(collection(db, 'testimonials'), {
      ...data,
      createdAt: new Date()
    });
  },

  async updateTestimonial(id, data) {
    return await updateDoc(doc(db, 'testimonials', id), {
      ...data,
      updatedAt: new Date()
    });
  },

  async deleteTestimonial(id) {
    return await deleteDoc(doc(db, 'testimonials', id));
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