# Twinfinity Photography

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