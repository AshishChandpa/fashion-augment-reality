# 3D AR Viewer

A Progressive Web App built with React.js for viewing 3D models with augmented reality capabilities on mobile devices.

## 🚀 Features

- **React.js Framework**: Modern component-based architecture
- **Vite Build Tool**: Lightning-fast development and optimized production builds
- **Automatic Model Loading**: No upload needed - model loads automatically on app start
- **Vercel-Ready**: Optimized configuration for one-click Vercel deployment
- **PWA with Vite Plugin**: Automatic service worker generation and PWA manifest
- **React Hooks**: Modern state management with useState, useEffect, useRef

## Features

### 🎨 3D Model Viewer
- Automatic loading of .glb models on app start
- Interactive controls (rotate, zoom, pan)
- Automatic model centering and scaling
- Support for animated models
- Model information display
- Fullscreen mode
- Reset view functionality

### 📱 Mobile AR Viewer
- WebXR-based augmented reality
- Access device rear camera
- Place 3D models in real-world environment
- Hit-test for surface detection
- Interactive model placement

### 💾 PWA Features
- Installable on mobile and desktop
- Offline capability with service worker
- Responsive design
- Fast loading and caching

## Tech Stack

- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **3D Engine**: Three.js 0.160
- **PWA**: vite-plugin-pwa
- **Deployment**: Vercel-optimized

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Viewer3D.jsx      # 3D viewer component
│   │   └── ARViewer.jsx       # AR viewer component
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── public/
│   ├── icon-192.png           # PWA icon
│   ├── icon-512.png           # PWA icon
│   ├── view_glb.glb          # Default model (preferred)
│   └── sample_*.glb           # Fallback model
├── package.json               # Dependencies
├── vite.config.js            # Vite configuration
├── vercel.json               # Vercel deployment config
└── index-react.html          # HTML template
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A modern web browser
- For AR: Mobile device with ARCore (Android) or ARKit (iOS)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Your 3D Model**
   
   Place your .glb file in the `public` folder with one of these names:
   - `view_glb.glb` (preferred - will be loaded first)
   - Or use the existing `sample_2026-02-14T062626.936.glb`

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   ```
   
   Production files will be in the `dist` folder

### Model Loading Behavior

The app automatically loads a 3D model on startup:
1. First tries to load `/view_glb.glb`
2. If not found, falls back to `/sample_2026-02-14T062626.936.glb`
3. No user interaction needed - model loads automatically

## Vercel Deployment

### Quick Deploy (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration
   - Click "Deploy"

3. **Done!** Your app is live at `https://your-project.vercel.app`

### Manual Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Configuration

The `vercel.json` file is pre-configured with:
- Proper routing for SPA
- MIME types for .glb files
- Service worker headers
- Security headers

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Component Structure

**App.jsx** - Main application
- Manages mode switching (3D Viewer ↔ AR)
- Handles automatic model loading
- Error handling and loading states

**Viewer3D.jsx** - 3D Viewer
- Three.js scene setup
- Model loading and rendering
- Camera controls (OrbitControls)
- Animations

**ARViewer.jsx** - AR Viewer
- WebXR session management
- Hit-test for surface detection
- Model placement in AR

## Usage

### 3D Viewer Mode

The app starts in 3D Viewer mode with the model automatically loaded:
- **Rotate**: Click and drag
- **Zoom**: Scroll or pinch (mobile)
- **Pan**: Right-click and drag (desktop) or two-finger drag (mobile)
- **Reset View**: Click the reset button
- **Fullscreen**: Click the fullscreen button

### AR Mode

1. Click "AR Mode" button (only available on supported devices)
2. Grant camera permissions when prompted
3. Point your camera at a flat surface
4. Wait for the white reticle to appear
5. Click "Place Model" to position the 3D model
6. Click "Reset Placement" to reposition
7. Click "Exit AR" to return to normal mode

## Browser Compatibility

### 3D Viewer
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)

### AR Features
- ✅ Chrome (Android with ARCore)
- ✅ Safari (iOS with ARKit)
- ❌ Desktop browsers (AR requires mobile device)

## Customization

### Change Default Model

Replace `/public/view_glb.glb` with your own .glb file

### Modify Colors

Edit gradients in `src/index.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust Model Scale

Edit scale factors in components:
```javascript
// In Viewer3D.jsx or ARViewer.jsx
const scale = 2 / maxDim; // Adjust this value
```

## Troubleshooting

### Model Not Loading
- Ensure the .glb file is in the `public` folder
- Check browser console for errors
- Verify file name matches expected names

### AR Mode Not Available
- Ensure you're using a supported mobile device
- Check that device has ARCore (Android) or ARKit (iOS)
- Verify the app is served over HTTPS (required for WebXR)

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version: `node --version` (should be 18+)

## Performance Tips

- Use compressed .glb files for faster loading
- Optimize models (reduce polygon count) for better performance
- Test on target devices before deployment
- Use texture compression when possible



## License

Open source and available for educational and commercial use.

## Support

For issues or questions, check:
- Browser console for error messages
- Vercel deployment logs
- WebXR compatibility for AR features

