# PWA Icons

This folder needs two icon files for the Progressive Web App:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

## How to Generate Icons

### Option 1: Use the Icon Generator (Recommended)

1. Open `create-icons.html` in your browser (from the root directory)
2. The page will automatically generate both icons
3. Right-click each icon and save as:
   - Save first icon as `icon-192.png`
   - Save second icon as `icon-512.png`
4. Move both files to this `public` folder

### Option 2: Use Your Own Design

Create two PNG files with these specifications:

**icon-192.png:**
- Size: 192x192 pixels
- Format: PNG
- Background: Solid color or transparent
- Content: Your app logo/icon

**icon-512.png:**
- Size: 512x512 pixels
- Format: PNG
- Background: Solid color or transparent
- Content: Your app logo/icon (same design as 192px version)

### Option 3: Use Online Tools

Use free online tools like:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

## After Adding Icons

Once you have the icons in place:

1. Verify the files exist:
   ```bash
   ls -la public/icon-*.png
   ```

2. Test the PWA installation:
   - Run `npm run dev`
   - Open in browser
   - Check for install prompt
   - Install and verify icons appear correctly

## Current Status

⚠️ **Icons not yet generated** - Please follow one of the options above to create the required icon files.

