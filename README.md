# Twinfinity Photography Website

A professional photography website with a complete admin dashboard for content management. Built with vanilla HTML, CSS, JavaScript, and Firebase backend. Optimized for GitHub Pages deployment.

## ✨ Features

### Public Website
- **Dynamic Content Management**: All website content is managed through the admin dashboard
- **Responsive Design**: Works perfectly on all devices
- **Professional Portfolio**: Dynamic gallery with Firebase-stored images
- **Contact & Booking**: Direct integration with Firebase and WhatsApp
- **Admin-Controlled Content**: Hero section, about section, services, pricing, testimonials all managed by admin
- **Profile Photo Display**: Admin's profile photo appears in the founders section

### Admin Dashboard  
- **Secure Authentication**: Firebase Authentication with admin credentials
- **Content Management**: Complete control over website content
- **Gallery Management**: Upload and manage portfolio images via Cloudinary
- **Category Management**: Create, edit, delete portfolio categories
- **Services & Pricing**: Manage service packages and add-ons
- **Testimonials**: Add and manage client testimonials
- **Order Management**: View and manage booking requests
- **Profile Management**: Upload and manage admin profile photo and information
- **Real-time Updates**: Changes appear on website immediately

## 🚀 Quick Start

### Prerequisites
- Firebase account with Firestore enabled
- Cloudinary account for image hosting
- Basic web development knowledge

### Setup Instructions

1. **Clone/Download** this repository
2. **Firebase Setup**:
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Add your domain to authorized domains
   - Update `firebase-config.js` with your config

3. **Cloudinary Setup**:
   - Create Cloudinary account
   - Create an unsigned upload preset named `twinfinity_photos`
   - Update `CLOUDINARY_CONFIG` in `firebase-config.js`

4. **Admin Account**:
   - Create admin user in Firebase Auth with email: `admin@gmail.com` and password: `admin123`
   - Or update the credentials in `firebase-config.js`

5. **Deploy**:
   - Upload all files to GitHub Pages, Netlify, or any static hosting
   - Access admin dashboard at `yoursite.com/admin.html`

## 📁 File Structure

```
TwinfinityPhotography/
├── index.html              # Main website
├── admin.html              # Admin dashboard
├── styles.css              # Main website styles
├── admin-styles.css        # Admin dashboard styles
├── script.js               # Main website JavaScript
├── admin-script.js         # Admin dashboard JavaScript
├── firebase-config.js      # Firebase configuration & API
├── fallback-storage.js     # Local storage fallback
├── functions/              # Firebase Functions (optional)
└── assets/                 # Static assets (fallback images)
```

## 🔧 Admin Features

### Content Management
- **Hero Section**: Edit main title and subtitle
- **About Section**: Update about text
- **Founders Section**: Manage founders section content
- **Profile Photo**: Upload/change/delete admin photo (displays in founders section)

### Portfolio Management
- **Categories**: Create photography categories (Wedding, Portrait, Event, etc.)
- **Gallery**: Upload images to categories via Cloudinary integration
- **Image Management**: Delete images from galleries

### Business Management
- **Services**: Add/edit/delete service packages with pricing
- **Add-ons**: Manage additional services
- **Testimonials**: Add/edit client testimonials
- **Orders**: View and manage booking requests
- **Settings**: Configure site settings, social media links, contact info

## 🎯 Admin Login

Default credentials:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

> ⚠️ **Important**: Change these credentials in production!

## 🌐 Website Sections

All website content is dynamically loaded from Firebase and can be managed through the admin dashboard:

1. **Hero Section**: Title, subtitle, call-to-action
2. **Founders Section**: Admin profile photo and bio (if uploaded)
3. **Portfolio**: Dynamic galleries organized by categories
4. **Services**: Service packages with pricing
5. **About**: Company information
6. **Testimonials**: Client reviews
7. **Booking**: Contact form that saves to Firebase and sends WhatsApp message
8. **Contact**: Social media links and contact information

## 🔨 Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 modules)
- **Backend**: Firebase Firestore, Firebase Authentication
- **Image Storage**: Cloudinary
- **Hosting**: GitHub Pages compatible

### Firebase Collections
- `settings`: Site configuration and content
- `categories`: Portfolio categories
- `gallery`: Portfolio images
- `services`: Service packages
- `addons`: Additional services
- `testimonials`: Client testimonials
- `orders`: Booking requests

### Key Features
- **No Server Required**: Pure client-side application
- **Real-time Updates**: Changes reflect immediately
- **Mobile Responsive**: Works on all devices
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Fast Loading**: Optimized assets and lazy loading
- **Professional Design**: Clean, modern photography website design

## 🔄 Workflow

1. **Admin logs in** to dashboard
2. **Manages content** through intuitive interface
3. **Uploads images** to Cloudinary via admin dashboard
4. **Changes reflect immediately** on public website
5. **Clients view** updated website and submit booking requests
6. **Admin manages** booking requests through dashboard

## 📞 Support & Customization

This is a complete, professional photography website ready for deployment. All content is managed through the admin dashboard, making it easy for photographers to maintain their website without technical knowledge.

For customization:
- Colors and styling can be modified in CSS files
- Additional sections can be added by following existing patterns
- Firebase security rules should be configured for production use

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access your site at `username.github.io/repository-name`

### Other Hosting
Works with any static hosting provider:
- Netlify
- Vercel
- Firebase Hosting
- Traditional web hosting

## ⚠️ Important Notes

- Make sure Firebase Authentication allows your domain
- Configure Cloudinary unsigned upload preset
- Update contact information in admin settings
- Test all functionality after deployment
- Consider implementing Firebase Security Rules for production

---

**Ready to use**: This is a complete photography website with professional admin dashboard. Simply configure Firebase and Cloudinary, then deploy!

A complete photography website with admin dashboard, built using Firebase for backend and Cloudinary for image management.

## Features

### Frontend
- **Responsive Design**: Mobile-first approach, works on all devices
- **Dynamic Content**: All content managed through admin dashboard
- **Dynamic Categories**: Admin can add/remove portfolio categories
- **Firebase Integration**: Real-time data fetching
- **Cloudinary Images**: Optimized image delivery
- **Contact Forms**: Integrated with Firebase for order management

### Admin Dashboard
- **Secure Login**: Firebase Authentication (admin@gmail.com / admin123)
- **Category Management**: Create/edit/delete portfolio categories  
- **Gallery Management**: Upload images via Cloudinary integration
- **Service Management**: Manage pricing and services
- **Order Management**: View and track client bookings
- **Content Management**: Edit hero text, about section, testimonials
- **Settings**: Update contact info, social links, site theme

## Setup Instructions

### 1. Firebase Setup
- Firebase project is already configured with your credentials
- Firestore database will be automatically initialized on first admin login
- Required collections: `categories`, `gallery`, `services`, `addons`, `orders`, `testimonials`, `settings`

### 2. Cloudinary Setup
- Account configured with your credentials
- Upload preset: `twinfinity_photos` (you need to create this in your Cloudinary settings)
- Images will be organized in folders: `twinfinity/{category-name}/`

### 3. Cloudinary Upload Preset Setup
1. Go to your Cloudinary Console
2. Navigate to Settings → Upload
3. Create a new Upload Preset with the name: `twinfinity_photos`
4. Set it to "Unsigned" mode
5. Set folder structure to allow dynamic folders

### 4. GitHub Pages Deployment
1. Push all files to your GitHub repository
2. Go to repository Settings → Pages
3. Select "Deploy from a branch" 
4. Choose "main" branch and "/ (root)" folder
5. Your site will be available at: `https://yourusername.github.io/TwinfinityPhotography`

## File Structure

```
TwinfinityPhotography/
├── index.html              # Main website
├── admin.html              # Admin dashboard
├── styles.css              # Main website styles
├── script.js               # Main website functionality (Firebase integration)
├── admin-styles.css        # Admin dashboard styles
├── admin-script.js         # Admin dashboard functionality
├── firebase-config.js      # Firebase configuration and API functions
├── eslint.config.js        # Code linting configuration
└── assets/                 # Static assets (logos, fallback images)
```

## Usage

### For Visitors
1. Browse portfolio categories dynamically created by admin
2. View gallery images served from Cloudinary
3. Fill out booking form with contact details
4. Form data saved to Firebase and optionally sent via WhatsApp

### For Admin
1. Visit `/admin.html`
2. Login with: admin@gmail.com / admin123
3. Manage all content through the dashboard:
   - Add/edit categories (e.g., "Birthday" category)
   - Upload images to categories
   - Update pricing and services
   - View and manage client orders
   - Edit website content and settings

## Dynamic Features

- **Auto-generating Categories**: When admin creates a "Birthday" category, it automatically appears in:
  - Portfolio filter buttons
  - Booking form event type dropdown
  - Gallery sections
- **Real-time Updates**: All changes in admin dashboard immediately reflect on the main site
- **Order Management**: Complete tracking system for client bookings
- **Content Management**: All text content editable through admin interface

## Technical Features

- **Modern JavaScript**: ES6+ modules, async/await
- **Firebase v10**: Latest Firebase SDK with modular imports
- **Responsive Design**: CSS Grid and Flexbox
- **Performance Optimized**: Lazy loading, optimized images
- **SEO Friendly**: Semantic HTML, proper meta tags
- **Accessibility**: ARIA labels, keyboard navigation
- **Security**: Input validation, XSS protection

## Admin Dashboard Sections

1. **Overview**: Stats and recent activity
2. **Categories**: Manage portfolio categories  
3. **Gallery**: Upload and manage images
4. **Services**: Manage pricing and service offerings
5. **Orders**: View and track client bookings
6. **Testimonials**: Manage client reviews
7. **Settings**: Site configuration and content

## Free Hosting

The entire system runs on free tiers:
- **GitHub Pages**: Free static hosting
- **Firebase**: Free tier (generous limits)
- **Cloudinary**: Free tier (25GB storage, 25GB bandwidth)

No server costs, completely free to run!

## Support

If you need help with setup or have questions, all the configuration is complete and ready to use. Just create the Cloudinary upload preset and you're ready to go!