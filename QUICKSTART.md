# Quick Start Guide - React 3D AR Viewer

Get your React 3D AR Viewer up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A modern web browser

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

This installs:
- React 18.2
- Three.js 0.160
- Vite 5.0
- vite-plugin-pwa
- All other dependencies

## Step 2: Generate PWA Icons (2 minutes)

**Option A: Use the Icon Generator**
1. Open `create-icons.html` in your browser
2. Right-click and save both generated icons
3. Save as `public/icon-192.png` and `public/icon-512.png`

**Option B: Use Your Own Icons**
- Create two PNG files: 192x192px and 512x512px
- Place in `public/` folder as `icon-192.png` and `icon-512.png`

See `public/ICONS-README.md` for detailed instructions.

## Step 3: Start Development Server (30 seconds)

```bash
npm run dev
```

The app will open at: `http://localhost:5173`

## Step 4: Test the App (1 minute)

✅ **3D Viewer Mode** (default)
- Model should load automatically
- Try rotating (click and drag)
- Try zooming (scroll wheel)
- Click reset button
- Click fullscreen button

✅ **AR Mode** (mobile only)
- Click "AR Mode" button
- Grant camera permissions
- Point at flat surface
- Click "Place Model"

## Step 5: Build for Production (30 seconds)

```bash
npm run build
```

Production files will be in the `dist/` folder.

## Step 6: Deploy to Vercel (2 minutes)

**Quick Deploy:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Or use GitHub:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

Done! Your app is live! 🎉

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── components/
│   ├── Viewer3D.jsx    # 3D viewer component
│   └── ARViewer.jsx    # AR viewer component
├── App.jsx             # Main app
├── main.jsx            # Entry point
└── index.css           # Styles

public/
├── view_glb.glb       # Your 3D model
├── manifest.json      # PWA manifest
├── icon-192.png       # PWA icon (generate this)
└── icon-512.png       # PWA icon (generate this)
```

## Customization

### Change the 3D Model

Replace `public/view_glb.glb` with your own .glb file.

### Change Colors

Edit `src/index.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust Model Scale

Edit `src/components/Viewer3D.jsx`:
```javascript
const scale = 2 / maxDim; // Change this value
```

## Troubleshooting

**Model not loading?**
- Check `public/view_glb.glb` exists
- Check browser console for errors

**AR mode not available?**
- AR requires HTTPS (use Vercel deployment)
- Requires mobile device with ARCore/ARKit

**Build errors?**
```bash
rm -rf node_modules
npm install
npm run build
```

## Next Steps

1. ✅ Generate PWA icons
2. ✅ Test locally
3. ✅ Deploy to Vercel
4. ✅ Test on mobile device
5. ✅ Share your app!

## Documentation

- **README-REACT.md** - Full documentation
- **VERCEL-DEPLOYMENT.md** - Deployment guide
- **REACT-MIGRATION-COMPLETE.md** - Migration details

## Support

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Three.js Docs](https://threejs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

---

**Ready to go! Start with `npm install` and `npm run dev`** 🚀

