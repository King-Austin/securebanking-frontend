# 🚀 Deployment Guide for SecureCipher Banking Frontend

## Overview
This guide covers deploying the SecureCipher Banking Frontend to Render, a modern cloud platform for static sites and web services.

## 🏗️ Project Structure

```
banking-frontend/
├── .env                     # Local development environment
├── .env.example            # Environment template
├── .env.production         # Production defaults
├── .gitignore              # Git ignore rules
├── render.yaml             # Render deployment configuration
├── build.sh                # Custom build script
├── vite.config.js          # Vite configuration with deployment optimizations
├── package.json            # Updated with deployment scripts
└── src/
    ├── config/
    │   └── environment.js   # Centralized environment configuration
    └── ...
```

## 🔧 Environment Configuration

### Development Environment
The `.env` file contains your local development configuration:
```bash
VITE_API_URL=http://127.0.0.1:8000/api
VITE_NODE_ENV=development
VITE_ENABLE_DEBUG=true
# ... other variables
```

### Production Environment
For production deployment, update these key variables:

```bash
# Update with your production API URL
VITE_API_URL=https://your-backend-api.onrender.com/api

# Production settings
VITE_NODE_ENV=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

## 📦 Deployment to Render

### Option 1: Automatic Deployment (Recommended)

1. **Connect Your Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the `banking-frontend` folder

2. **Configure Build Settings**
   - **Build Command**: `npm ci && npm run build:production`
   - **Publish Directory**: `dist`
   - **Pull Request Previews**: Enabled (recommended)

3. **Set Environment Variables**
   In Render dashboard, add these environment variables:
   ```
   VITE_API_URL=https://your-backend-api.onrender.com/api
   VITE_APP_NAME=SecureCipher Bank
   VITE_NODE_ENV=production
   VITE_ENABLE_DEBUG=false
   VITE_ENABLE_ANALYTICS=true
   VITE_CURRENCY_SYMBOL=₦
   ```

### Option 2: Blueprint Deployment

1. **Use the render.yaml file**
   - The included `render.yaml` contains complete deployment configuration
   - Update the `VITE_API_URL` value in the file
   - Render will automatically detect and use this configuration

### Option 3: Manual Deployment

1. **Build locally**:
   ```bash
   npm ci
   npm run build:production
   ```

2. **Deploy the `dist` folder** to any static hosting service

## 🔒 Security Configuration

The deployment includes security headers:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts access to sensitive APIs

## 🌐 Custom Domain Setup

1. **Add Custom Domain in Render**:
   - Go to your site settings
   - Add your custom domain
   - Update DNS records as instructed

2. **Update CORS Settings**:
   - Ensure your Django backend allows your domain in `CORS_ALLOWED_ORIGINS`
   - Add both `www` and non-`www` versions

## 📊 Performance Optimizations

The build is optimized for production:
- **Code Splitting**: Vendor, UI, and utility chunks
- **Minification**: Enabled in production
- **Source Maps**: Disabled in production for security
- **Bundle Analysis**: Available via `npm run analyze`

## 🔍 Environment Variable Reference

### Required Variables
- `VITE_API_URL` - Your backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_NODE_ENV` - Environment (development/production)

### Optional Variables
- `VITE_ENABLE_DEBUG` - Enable debug logging
- `VITE_ENABLE_ANALYTICS` - Enable analytics tracking
- `VITE_CURRENCY_SYMBOL` - Currency symbol (₦)
- `VITE_SUPPORT_EMAIL` - Support contact email
- `VITE_SUPPORT_PHONE` - Support contact phone

## 🚀 Deployment Steps

### Pre-deployment Checklist
- [ ] Update `VITE_API_URL` with your production backend URL
- [ ] Set `VITE_NODE_ENV=production`
- [ ] Disable debug mode (`VITE_ENABLE_DEBUG=false`)
- [ ] Configure analytics and error reporting
- [ ] Test the build locally: `npm run build:production && npm run preview`

### Deploy to Render
1. **Push to GitHub**: Ensure your code is pushed to your repository
2. **Create Render Service**: Connect your repo to Render
3. **Configure Environment**: Set production environment variables
4. **Deploy**: Render will automatically build and deploy
5. **Verify**: Check your deployed site works correctly

### Post-deployment
- [ ] Test all functionality on the live site
- [ ] Verify API connectivity
- [ ] Check browser console for errors
- [ ] Test on different devices and browsers
- [ ] Set up monitoring and analytics

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `VITE_API_URL` is correct
   - Check CORS settings in Django backend
   - Ensure backend is deployed and accessible

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Restart the Render deployment after adding variables
   - Check variables are set in Render dashboard

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in `package.json`
   - Check build logs for specific error messages

4. **Routing Issues (404 on Refresh)**
   - Verify SPA routing is configured (`render.yaml` includes this)
   - Check that `/*` routes to `index.html`

### Debug Commands
```bash
# Test build locally
npm run build:production
npm run preview:production

# Check environment variables
npm run dev  # Check console for debug output

# Lint and fix issues
npm run lint:fix
```

## 📞 Support

If you encounter issues:
1. Check the [Render Documentation](https://render.com/docs)
2. Review build logs in Render dashboard
3. Test locally first with `npm run build:production`
4. Check environment configuration

## 🎉 Success!

Your SecureCipher Banking Frontend should now be deployed and accessible at your Render URL. The application is optimized for performance, security, and reliability.

Remember to:
- Monitor your deployment regularly
- Keep dependencies updated
- Test new features in preview deployments
- Set up proper monitoring and error tracking
