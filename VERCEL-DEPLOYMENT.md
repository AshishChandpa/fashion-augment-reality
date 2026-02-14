# Vercel Deployment Guide - 3D AR Viewer React App

Complete guide for deploying your React 3D AR Viewer to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works perfectly)
- Your React app ready with all files
- 3D model file (.glb) in the `public` folder

## Method 1: GitHub Integration (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - React 3D AR Viewer"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in (use GitHub for easy integration)
3. Click **"New Project"**
4. Click **"Import Git Repository"**
5. Select your repository from the list
6. Vercel will auto-detect the Vite configuration

### Step 3: Configure Project

Vercel should automatically detect:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

If not auto-detected, set these manually.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

### Step 5: Verify Deployment

Check these features:
- ✅ App loads correctly
- ✅ 3D model displays
- ✅ Controls work (rotate, zoom, reset)
- ✅ Mode switching works
- ✅ PWA can be installed
- ✅ AR mode available on mobile (requires HTTPS - Vercel provides this)

## Method 2: Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (enter a name)
# - Directory? ./
# - Override settings? No
```

### Step 4: Deploy to Production

```bash
vercel --prod
```

## Configuration Files

Your project includes these pre-configured files:

### vercel.json

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*).glb",
      "headers": [
        { "key": "Content-Type", "value": "model/gltf-binary" }
      ]
    }
  ]
}
```

This ensures:
- SPA routing works correctly
- .glb files have correct MIME type
- Service worker functions properly

### vite.config.js

Pre-configured with:
- React plugin
- PWA plugin with auto-update
- Optimized build settings
- Service worker generation

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project dashboard
2. Click **"Settings"** → **"Domains"**
3. Click **"Add"**
4. Enter your domain name

### Step 2: Configure DNS

Add these records to your domain's DNS:

**For root domain (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Verification

- DNS propagation takes 24-48 hours
- Vercel will automatically provision SSL certificate
- Your app will be available at your custom domain

## Environment Variables

If you need environment variables:

1. Go to **Settings** → **Environment Variables**
2. Add variables:
   - `VITE_API_KEY` (example)
   - `VITE_MODEL_URL` (example)
3. Redeploy for changes to take effect

Access in code:
```javascript
const apiKey = import.meta.env.VITE_API_KEY;
```

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch triggers production deployment
- Pull requests get preview deployments
- Each deployment gets a unique URL

### Branch Deployments

```bash
# Deploy specific branch
git checkout feature-branch
git push origin feature-branch
# Vercel automatically creates preview deployment
```

## Model File Management

### Adding Your Model

1. Place your .glb file in the `public` folder
2. Name it `view_glb.glb` (preferred) or update the fallback name
3. Commit and push:
   ```bash
   git add public/view_glb.glb
   git commit -m "Add 3D model"
   git push
   ```
4. Vercel will automatically redeploy

### Large Model Files

For models > 10MB:
- Consider using Git LFS (Large File Storage)
- Or host models on CDN and update URLs in code

## Monitoring and Analytics

### Vercel Analytics

1. Go to **Analytics** tab in project dashboard
2. View:
   - Page views
   - Unique visitors
   - Performance metrics
   - Real User Monitoring (RUM)

### Build Logs

- Click on any deployment
- View **"Building"** logs for errors
- Check **"Functions"** logs if using serverless functions

## Troubleshooting

### Build Fails

**Error: "Command failed: npm run build"**

Solution:
```bash
# Test build locally first
npm run build

# Check for errors
# Fix any TypeScript or ESLint errors
# Push fixes and redeploy
```

### Model Not Loading

**Issue: 404 error for .glb file**

Solution:
- Ensure file is in `public` folder
- Check file name matches code
- Verify `vercel.json` headers configuration

### AR Mode Not Working

**Issue: AR button disabled**

Solution:
- AR requires HTTPS (Vercel provides this automatically)
- Test on actual mobile device with ARCore/ARKit
- Check browser console for WebXR errors

### Service Worker Issues

**Issue: PWA not updating**

Solution:
```bash
# Clear browser cache
# Uninstall PWA
# Reinstall from updated deployment
```

### 404 on Page Refresh

**Issue: Refreshing page shows 404**

Solution:
- Ensure `vercel.json` has correct rewrites
- Should have: `{ "source": "/(.*)", "destination": "/index.html" }`

## Performance Optimization

### Enable Compression

Vercel automatically enables:
- Gzip compression
- Brotli compression
- HTTP/2

### Optimize Build

In `vite.config.js`:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'three': ['three'],
        'three-loaders': ['three/examples/jsm/loaders/GLTFLoader']
      }
    }
  }
}
```

### Image Optimization

Use Vercel Image Optimization:
```javascript
import Image from 'next/image'; // If using Next.js
// Or optimize images before deployment
```

## Security

Vercel provides:
- ✅ Automatic HTTPS/SSL
- ✅ DDoS protection
- ✅ Security headers (configured in vercel.json)
- ✅ Edge network protection

## Rollback Deployment

If something goes wrong:

1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**
4. Previous version is now live

## Cost Considerations

**Free Tier Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments
- Analytics

**Paid Plans:**
- More bandwidth
- Team collaboration
- Advanced analytics
- Priority support

## Best Practices

1. **Test Locally First**
   ```bash
   npm run build
   npm run preview
   ```

2. **Use Environment Variables**
   - Never commit API keys
   - Use Vercel environment variables

3. **Monitor Performance**
   - Check Vercel Analytics regularly
   - Optimize based on real user data

4. **Keep Dependencies Updated**
   ```bash
   npm outdated
   npm update
   ```

5. **Use Preview Deployments**
   - Test changes in preview before merging to main
   - Share preview URLs with team

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Three.js Documentation](https://threejs.org/docs)
- [WebXR Documentation](https://immersiveweb.dev)

## Quick Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs YOUR_DEPLOYMENT_URL

# Remove deployment
vercel rm YOUR_DEPLOYMENT_URL
```

---

**Your app is now live! 🎉**

Share your deployment URL and enjoy your 3D AR Viewer PWA!

