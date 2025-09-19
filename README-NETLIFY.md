# Netlify Deployment Guide

## Files Created for Netlify Hosting

### 1. `netlify.toml`
- Netlify configuration file
- Defines build settings and redirects
- Sets Node.js version to 18

### 2. `build.js`
- Static site generator
- Converts EJS templates to HTML
- Copies public assets to dist folder

### 3. `netlify/functions/`
- Serverless functions for dynamic features
- `server.js` - Main server function
- `contact.js` - Contact form handler

### 4. `_redirects`
- Netlify redirects file
- Handles SPA routing

## Deployment Steps

### Option 1: Static Site (Recommended)
1. Run `npm run build` to generate static files
2. Deploy the `dist` folder to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Option 2: Serverless Functions
1. Connect your GitHub repository to Netlify
2. Netlify will automatically detect the `netlify.toml` file
3. Set environment variables in Netlify dashboard:
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASS` - Your Gmail app password

## Environment Variables
Set these in Netlify dashboard:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail app password (not regular password)

## Build Commands
- `npm run build` - Build static site
- `npm run dev` - Development server
- `npm start` - Production server

## Features
- ✅ Static site generation
- ✅ Serverless contact form
- ✅ Resume download
- ✅ vCard generation
- ✅ Responsive design
- ✅ SEO optimized

## Notes
- The contact form requires Gmail app password
- Static build is faster and more reliable
- Serverless functions provide dynamic features
- All routes redirect to index.html for SPA behavior
