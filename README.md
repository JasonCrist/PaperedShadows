# Shadow Box Layer Generator

A web-based tool for converting images into multi-layer shadow art silhouettes for Cricut cutting machines.

## Features

- 🎨 **Upload any image** - Works with photos, illustrations, or designs
- 🖌️ **Manual Depth Guidance** - Paint on your image to mark foreground, middle, and background elements for better layer detection
- 🔢 **Customizable layers** - Choose 3-10 depth layers
- ⚙️ **Adjustable detail** - Control silhouette complexity for easier cutting
- ✨ **Detail Refinement Tools** - Simplify, add detail, smooth, or clean up individual layers after generation
- 📏 **Spacing guidance** - Set physical spacing between paper layers
- 🎭 **3D Preview** - Interactive visualization of assembled shadow box with rotation and lighting controls
- 📦 **SVG Export** - Download individual layers or all as ZIP
- 💡 **Assembly instructions** - Included guide for building your shadow box
- ↩️ **Undo/Redo** - Full history for refinement changes

## How It Works

1. **Upload** - Choose an image with clear depth and interesting subjects
2. **Guide Depth (Optional)** - Paint on the image to identify what's close and what's far away
   - Green = Foreground (closest to camera)
   - Yellow = Middle distance
   - Blue = Background (farthest away)
3. **Configure** - Adjust number of layers, detail level, and spacing
4. **Generate** - The app analyzes depth (using your guidance) and creates layer silhouettes
5. **Refine Details** - Adjust individual layers with simplify, add detail, smooth, or cleanup tools
6. **Preview** - See your assembled shadow box in 3D with interactive controls
7. **Download** - Get SVG files ready for Cricut Design Space
8. **Create** - Cut, stack, and assemble your shadow box art!

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

### Manual Depth Guidance (Optional but Powerful!)

The manual depth annotation tool dramatically improves layer accuracy. Here's how to use it:

**Why use it?**
- The automatic depth detection works well but isn't perfect
- Helps when foreground/background aren't obvious
- Gives you precise control over which elements end up in which layer

**How to use it:**
1. Select a depth tool (Foreground, Middle, or Background)
2. Adjust brush size to paint quickly or precisely
3. Paint over the parts of your image that belong at that depth
4. Toggle "Show Depth Map" to see what the algorithm sees
5. The more you paint, the better the results!

**Pro tips:**
- Start with the most obvious elements (main subject = foreground, sky = background)
- You don't need to paint everything - just key areas
- Larger brush for big areas, smaller brush for precision
- Click "Clear All" to start over if needed
- You can skip this step if the image has obvious depth

### Detail Refinement Tools

After generating layers, you can fine-tune each one individually:

**Simplify** - Reduces path complexity
- Use when layers are too intricate for your Cricut to cut
- Makes smoother, bolder shapes
- Great for reducing cutting time

**Add Detail** - Increases path complexity
- Use when layers look too "blocky"
- Adds intermediate points for smoother curves
- Good for organic shapes

**Smooth** - Applies curve smoothing
- Removes jagged edges
- Creates flowing, organic lines
- Helps with natural subjects like animals or plants

**Clean Up** - Removes small artifacts
- Deletes tiny disconnected pieces
- Cleans up noise from the detection
- Use before cutting to avoid tiny bits

**Undo** - Reverts last change
- Full history of up to 20 changes
- Experiment freely - you can always undo!

**Workflow suggestion:**
1. Generate your layers
2. Look at each layer in the dropdown
3. Clean up small artifacts first
4. Then simplify or add detail as needed
5. Finally smooth for polish
6. Check the 3D preview to see how it looks assembled

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

## Why These Features Matter

**Manual Depth Guidance:**
- Real-world images don't always have "obvious" depth
- A person wearing dark clothes in front of a dark background? The algorithm might struggle.
- Beach scene with light sand and light sky? Let the app know what's what!
- You become the "AI trainer" - guide it to see what you see

**Detail Refinement:**
- Every Cricut has limits on how intricate a cut can be
- Some designs need simplification, others need more detail
- Fine-tune for YOUR machine and YOUR material
- Iterative process: generate, refine, perfect!

**3D Preview:**
- Catch problems before cutting expensive cardstock
- See if layers overlap in confusing ways
- Visualize the final depth effect
- Make informed decisions about layer count

The combination of these tools gives you unprecedented control over your shadow box creation!

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
