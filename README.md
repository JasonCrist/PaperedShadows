# Shadow Box Layer Generator

A web-based tool for converting images into multi-layer shadow art silhouettes for Cricut cutting machines.

## Features

- 🎨 **Upload any image** - Works with photos, illustrations, or designs
- 🔢 **Customizable layers** - Choose 3-10 depth layers
- ⚙️ **Adjustable detail** - Control silhouette complexity for easier cutting
- 📏 **Spacing guidance** - Set physical spacing between paper layers
- 🎭 **3D Preview** - Interactive visualization of assembled shadow box with rotation and lighting controls
- 📦 **SVG Export** - Download individual layers or all as ZIP
- 💡 **Assembly instructions** - Included guide for building your shadow box

## How It Works

1. **Upload** - Choose an image with clear depth and interesting subjects
2. **Configure** - Adjust number of layers, detail level, and spacing
3. **Generate** - The app analyzes depth and creates layer silhouettes
4. **Preview** - See your assembled shadow box in 3D with interactive controls
5. **Download** - Get SVG files ready for Cricut Design Space
6. **Create** - Cut, stack, and assemble your shadow box art!

## Hosting on GitHub Pages

### Quick Setup

1. **Create a new repository**
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it something like `shadow-box-generator`
   - Choose "Public" to enable GitHub Pages

2. **Upload files**
   - Upload these files to your repository:
     - `index.html`
     - `styles.css`
     - `app.js`
     - `README.md`

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Click "Save"

4. **Access your site**
   - Your site will be live at: `https://[your-username].github.io/[repository-name]/`
   - Example: `https://johndoe.github.io/shadow-box-generator/`

### Using Git Command Line

```bash
# Clone your repository
git clone https://github.com/[your-username]/[repository-name].git
cd [repository-name]

# Add the files
git add index.html styles.css app.js README.md
git commit -m "Initial commit: Shadow Box Layer Generator"
git push origin main

# Enable GitHub Pages through the website settings
```

## Technical Details

### Algorithm

The app uses a multi-step process to create shadow box layers:

1. **Depth Estimation**
   - Analyzes image luminance and vertical position
   - Creates a depth map representing front-to-back distances
   - Applies Gaussian blur for smooth transitions

2. **Layer Generation**
   - Divides depth map into N equal ranges
   - Creates binary masks for each depth layer
   - Applies morphological operations (erosion/dilation) to clean up noise

3. **Contour Extraction**
   - Finds boundaries between solid and transparent regions
   - Traces contours to create closed shapes
   - Simplifies paths based on detail level setting

4. **SVG Export**
   - Converts contours to SVG path data
   - Generates individual SVG files for each layer
   - Packages everything with assembly instructions

### Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Works entirely client-side - no server required
- No external API calls - all processing happens in your browser

### Performance

- Images are automatically resized to max 800px for processing
- Typical generation time: 2-5 seconds
- Works best with images that have clear subjects and backgrounds

## Tips for Best Results

### Image Selection
- ✅ Clear subject with distinct foreground/background
- ✅ Good contrast and depth cues
- ✅ Interesting silhouettes
- ❌ Avoid flat, uniformly lit images
- ❌ Avoid images with fine, intricate details everywhere

### Settings
- **3-5 layers**: Good for simple designs, faster cutting
- **6-8 layers**: Great balance of depth and complexity
- **9-10 layers**: Maximum depth effect, more challenging assembly

- **Low detail**: Simpler shapes, easier to cut
- **Medium detail**: Balanced complexity (recommended)
- **High detail**: Intricate silhouettes, challenging cuts

### 3D Preview Controls
- **Rotation**: Spin the shadow box left/right to view from different angles
- **Tilt**: Adjust the vertical viewing angle
- **Lighting**: Control backlight intensity to see depth effect
- **Hover interaction**: Mouse over individual layer cards to highlight them in the 3D view
- **Reset View**: Return to default viewing angle

### Assembly Tips
- Use 65-110lb cardstock for easy cutting
- Foam mounting squares work great for spacing
- Add LED backlighting for dramatic effect
- Frame with at least 2" depth for 5-layer designs

## Examples

The examples in the uploaded images show:
1. **Forest scene** - Woodland animals with layered trees
2. **Ocean wave** - Flowing water with diver silhouette  
3. **Orca underwater** - Marine life with bubble details

These demonstrate the shadow box style this tool creates!

## Limitations

- Processing is client-side, so very large images may be slow
- Depth estimation is simplified (not ML-based) for browser performance
- Best results with images that have natural depth separation
- Complex, busy images may produce overly intricate layers

## Future Enhancements

Possible improvements:
- [ ] Manual layer editing/refinement
- [ ] Color layer options (not just black silhouettes)
- [ ] Template library with pre-designed compositions
- [ ] Advanced depth estimation using TensorFlow.js
- [ ] Direct Cricut Design Space integration
- [ ] 3D preview of assembled shadow box

## License

MIT License - Feel free to use, modify, and distribute!

## Credits

Created for shadow art enthusiasts and Cricut crafters.
Fonts: Fraunces (display) and DM Sans (body) from Google Fonts.

---

**Enjoy creating beautiful shadow box art! 🎨✨**
