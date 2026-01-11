// Shadow Box Layer Generator - Main Application

class ShadowBoxGenerator {
    constructor() {
        this.uploadedImage = null;
        this.imageData = null;
        this.layers = [];
        this.settings = {
            numLayers: 5,
            threshold: 2,
            spacing: 0.25
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateSettingValues();
    }
    
    setupEventListeners() {
        // Upload zone
        const uploadZone = document.getElementById('uploadZone');
        const imageInput = document.getElementById('imageInput');
        
        uploadZone.addEventListener('click', () => imageInput.click());
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file);
            }
        });
        
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });
        
        // Change image button
        document.getElementById('changeImage').addEventListener('click', () => {
            this.resetUpload();
        });
        
        // Settings
        const numLayersSlider = document.getElementById('numLayers');
        const thresholdSlider = document.getElementById('threshold');
        const spacingSlider = document.getElementById('spacing');
        
        numLayersSlider.addEventListener('input', (e) => {
            this.settings.numLayers = parseInt(e.target.value);
            this.updateSettingValues();
        });
        
        thresholdSlider.addEventListener('input', (e) => {
            this.settings.threshold = parseInt(e.target.value);
            this.updateSettingValues();
        });
        
        spacingSlider.addEventListener('input', (e) => {
            this.settings.spacing = parseFloat(e.target.value);
            this.updateSettingValues();
        });
        
        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateLayers();
        });
        
        // Download all button
        document.getElementById('downloadAllBtn').addEventListener('click', () => {
            this.downloadAllLayers();
        });
        
        // Start over button
        document.getElementById('startOverBtn').addEventListener('click', () => {
            this.reset();
        });
    }
    
    updateSettingValues() {
        document.getElementById('numLayersValue').textContent = this.settings.numLayers;
        
        const thresholdLabels = ['Low', 'Medium', 'High'];
        document.getElementById('thresholdValue').textContent = 
            thresholdLabels[this.settings.threshold - 1];
        
        document.getElementById('spacingValue').textContent = 
            `${this.settings.spacing}"`;
    }
    
    handleImageUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.uploadedImage = img;
                this.showPreview(e.target.result);
                this.showSettings();
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    showPreview(imageUrl) {
        const previewContainer = document.getElementById('previewContainer');
        const previewImage = document.getElementById('previewImage');
        const uploadZone = document.getElementById('uploadZone');
        
        previewImage.src = imageUrl;
        uploadZone.style.display = 'none';
        previewContainer.style.display = 'block';
    }
    
    showSettings() {
        document.getElementById('settingsSection').style.display = 'block';
    }
    
    resetUpload() {
        document.getElementById('uploadZone').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('settingsSection').style.display = 'none';
        this.uploadedImage = null;
    }
    
    async generateLayers() {
        // Show processing section
        document.getElementById('settingsSection').style.display = 'none';
        document.getElementById('processingSection').style.display = 'block';
        
        try {
            // Extract image data
            await this.processImage();
            
            // Update progress
            this.updateProgress(30, 'Analyzing depth information...');
            await this.sleep(500);
            
            // Generate depth map
            const depthMap = this.generateDepthMap();
            
            this.updateProgress(50, 'Creating layer silhouettes...');
            await this.sleep(500);
            
            // Create layers
            this.layers = this.createLayersFromDepth(depthMap);
            
            this.updateProgress(80, 'Generating SVG files...');
            await this.sleep(500);
            
            // Convert to SVG
            await this.convertLayersToSVG();
            
            this.updateProgress(100, 'Complete!');
            await this.sleep(300);
            
            // Show results
            this.showResults();
        } catch (error) {
            console.error('Error generating layers:', error);
            alert('An error occurred while generating layers. Please try again.');
            this.reset();
        }
    }
    
    updateProgress(percent, status) {
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('processingStatus').textContent = status;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async processImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize image to manageable size
        const maxSize = 800;
        let width = this.uploadedImage.width;
        let height = this.uploadedImage.height;
        
        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(this.uploadedImage, 0, 0, width, height);
        this.imageData = ctx.getImageData(0, 0, width, height);
        this.canvas = canvas;
    }
    
    generateDepthMap() {
        const { data, width, height } = this.imageData;
        const depthMap = new Float32Array(width * height);
        
        // Simple depth estimation based on:
        // 1. Luminance (darker = farther)
        // 2. Position (bottom = closer for ground-based scenes)
        // 3. Contrast (sharp edges = closer)
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // Luminance
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                
                // Position bias (bottom of image = closer)
                const positionBias = (height - y) / height;
                
                // Combine factors
                const depth = (luminance / 255) * 0.6 + positionBias * 0.4;
                
                depthMap[y * width + x] = depth;
            }
        }
        
        // Apply gaussian blur for smoothness
        return this.gaussianBlur(depthMap, width, height, 3);
    }
    
    gaussianBlur(data, width, height, radius) {
        const result = new Float32Array(data.length);
        const kernel = this.makeGaussianKernel(radius);
        const kernelSize = kernel.length;
        const halfKernel = Math.floor(kernelSize / 2);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let weightSum = 0;
                
                for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                    for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                        const px = Math.max(0, Math.min(width - 1, x + kx));
                        const py = Math.max(0, Math.min(height - 1, y + ky));
                        const weight = kernel[ky + halfKernel][kx + halfKernel];
                        
                        sum += data[py * width + px] * weight;
                        weightSum += weight;
                    }
                }
                
                result[y * width + x] = sum / weightSum;
            }
        }
        
        return result;
    }
    
    makeGaussianKernel(radius) {
        const size = radius * 2 + 1;
        const kernel = [];
        const sigma = radius / 2;
        const constant = 1 / (2 * Math.PI * sigma * sigma);
        
        for (let y = -radius; y <= radius; y++) {
            const row = [];
            for (let x = -radius; x <= radius; x++) {
                const exponent = -(x * x + y * y) / (2 * sigma * sigma);
                row.push(constant * Math.exp(exponent));
            }
            kernel.push(row);
        }
        
        return kernel;
    }
    
    createLayersFromDepth(depthMap) {
        const { width, height } = this.imageData;
        const layers = [];
        const numLayers = this.settings.numLayers;
        
        // Create threshold levels for each layer
        for (let i = 0; i < numLayers; i++) {
            const minDepth = i / numLayers;
            const maxDepth = (i + 1) / numLayers;
            
            const layerMask = new Uint8Array(width * height);
            
            for (let j = 0; j < depthMap.length; j++) {
                const depth = depthMap[j];
                layerMask[j] = (depth >= minDepth && depth < maxDepth) ? 255 : 0;
            }
            
            // Apply morphological operations to clean up the mask
            const cleanedMask = this.cleanMask(layerMask, width, height);
            
            layers.push({
                number: i + 1,
                depth: `${minDepth.toFixed(2)} - ${maxDepth.toFixed(2)}`,
                mask: cleanedMask,
                width,
                height
            });
        }
        
        return layers;
    }
    
    cleanMask(mask, width, height) {
        // Apply erosion then dilation to remove noise
        const eroded = this.erode(mask, width, height, 2);
        const dilated = this.dilate(eroded, width, height, 2);
        return dilated;
    }
    
    erode(mask, width, height, size) {
        const result = new Uint8Array(mask.length);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let minVal = 255;
                
                for (let dy = -size; dy <= size; dy++) {
                    for (let dx = -size; dx <= size; dx++) {
                        const px = Math.max(0, Math.min(width - 1, x + dx));
                        const py = Math.max(0, Math.min(height - 1, y + dy));
                        minVal = Math.min(minVal, mask[py * width + px]);
                    }
                }
                
                result[y * width + x] = minVal;
            }
        }
        
        return result;
    }
    
    dilate(mask, width, height, size) {
        const result = new Uint8Array(mask.length);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let maxVal = 0;
                
                for (let dy = -size; dy <= size; dy++) {
                    for (let dx = -size; dx <= size; dx++) {
                        const px = Math.max(0, Math.min(width - 1, x + dx));
                        const py = Math.max(0, Math.min(height - 1, y + dy));
                        maxVal = Math.max(maxVal, mask[py * width + px]);
                    }
                }
                
                result[y * width + x] = maxVal;
            }
        }
        
        return result;
    }
    
    async convertLayersToSVG() {
        const thresholdLevel = this.settings.threshold;
        const simplificationFactor = [5, 3, 1][thresholdLevel - 1]; // Lower = more detail
        
        for (const layer of this.layers) {
            const contours = this.findContours(layer.mask, layer.width, layer.height);
            const svgPath = this.contoursToSVGPath(contours, simplificationFactor);
            
            layer.svg = this.createSVGElement(svgPath, layer.width, layer.height);
            layer.svgString = this.svgToString(layer.svg, layer.width, layer.height);
        }
    }
    
    findContours(mask, width, height) {
        const visited = new Uint8Array(mask.length);
        const contours = [];
        
        // Find all boundary pixels
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                if (mask[idx] === 255 && !visited[idx]) {
                    // Check if this is a boundary pixel
                    const isBoundary = 
                        mask[idx - 1] === 0 || mask[idx + 1] === 0 ||
                        mask[idx - width] === 0 || mask[idx + width] === 0;
                    
                    if (isBoundary) {
                        const contour = this.traceContour(mask, visited, x, y, width, height);
                        if (contour.length > 20) { // Minimum contour size
                            contours.push(contour);
                        }
                    }
                }
            }
        }
        
        return contours;
    }
    
    traceContour(mask, visited, startX, startY, width, height) {
        const contour = [];
        const directions = [
            [1, 0], [1, 1], [0, 1], [-1, 1],
            [-1, 0], [-1, -1], [0, -1], [1, -1]
        ];
        
        let x = startX;
        let y = startY;
        let dir = 0;
        
        const maxSteps = width * height;
        let steps = 0;
        
        do {
            contour.push([x, y]);
            visited[y * width + x] = 1;
            
            let found = false;
            for (let i = 0; i < 8; i++) {
                const newDir = (dir + i) % 8;
                const [dx, dy] = directions[newDir];
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const idx = ny * width + nx;
                    if (mask[idx] === 255) {
                        x = nx;
                        y = ny;
                        dir = (newDir + 6) % 8;
                        found = true;
                        break;
                    }
                }
            }
            
            if (!found) break;
            steps++;
        } while ((x !== startX || y !== startY) && steps < maxSteps);
        
        return contour;
    }
    
    contoursToSVGPath(contours, simplification) {
        let pathData = '';
        
        for (const contour of contours) {
            if (contour.length === 0) continue;
            
            // Simplify contour
            const simplified = this.simplifyContour(contour, simplification);
            
            if (simplified.length < 3) continue;
            
            pathData += `M ${simplified[0][0]},${simplified[0][1]} `;
            
            for (let i = 1; i < simplified.length; i++) {
                pathData += `L ${simplified[i][0]},${simplified[i][1]} `;
            }
            
            pathData += 'Z ';
        }
        
        return pathData;
    }
    
    simplifyContour(contour, tolerance) {
        if (contour.length < 3) return contour;
        
        const simplified = [contour[0]];
        
        for (let i = 1; i < contour.length - 1; i += tolerance) {
            simplified.push(contour[i]);
        }
        
        simplified.push(contour[contour.length - 1]);
        
        return simplified;
    }
    
    createSVGElement(pathData, width, height) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'black');
        
        svg.appendChild(path);
        
        return svg;
    }
    
    svgToString(svg, width, height) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
${svg.innerHTML}
</svg>`;
    }
    
    showResults() {
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        
        const layerGrid = document.getElementById('layerGrid');
        layerGrid.innerHTML = '';
        
        this.layers.forEach((layer, index) => {
            const layerCard = this.createLayerCard(layer, index);
            layerGrid.appendChild(layerCard);
        });
    }
    
    createLayerCard(layer, index) {
        const card = document.createElement('div');
        card.className = 'layer-card';
        
        card.innerHTML = `
            <div class="layer-header">
                <span class="layer-number">Layer ${layer.number}</span>
                <span class="layer-depth">${layer.number === 1 ? 'Back' : layer.number === this.settings.numLayers ? 'Front' : 'Middle'}</span>
            </div>
            <div class="layer-preview">
                ${layer.svg.outerHTML}
            </div>
            <button class="layer-download-btn" data-layer="${index}">
                Download SVG
            </button>
        `;
        
        card.querySelector('.layer-download-btn').addEventListener('click', () => {
            this.downloadLayer(index);
        });
        
        return card;
    }
    
    downloadLayer(index) {
        const layer = this.layers[index];
        const blob = new Blob([layer.svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `shadow-box-layer-${layer.number}.svg`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    async downloadAllLayers() {
        const zip = new JSZip();
        
        // Add all layers to ZIP
        this.layers.forEach(layer => {
            zip.file(`layer-${layer.number}.svg`, layer.svgString);
        });
        
        // Add README with instructions
        const readme = this.generateReadme();
        zip.file('README.txt', readme);
        
        // Generate and download ZIP
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shadow-box-layers.zip';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    generateReadme() {
        return `Shadow Box Layers - Assembly Instructions
==========================================

Generated on: ${new Date().toLocaleDateString()}
Number of Layers: ${this.settings.numLayers}
Recommended Spacing: ${this.settings.spacing} inches

CUTTING INSTRUCTIONS:
1. Import each SVG file into Cricut Design Space
2. Cut each layer on cardstock or mat board
3. Recommended materials: 65-110lb cardstock or 2-3mm chipboard

ASSEMBLY INSTRUCTIONS:
1. Start with Layer 1 (the back layer)
2. Add foam mounting tape or spacers (${this.settings.spacing}" thick)
3. Stack Layer 2 on top
4. Repeat for all layers, working from back to front
5. The final layer should be Layer ${this.settings.numLayers}

OPTIONAL ENHANCEMENTS:
- Add LED strip lighting behind Layer 1 for dramatic illumination
- Use colored cardstock for artistic effects
- Add a white or light-colored backing board for contrast
- Frame in a shadow box frame with ${this.settings.numLayers * this.settings.spacing + 1}" minimum depth

TIPS:
- Test your spacing with scrap materials first
- Use a level to ensure straight alignment
- Press firmly when adhering each layer
- Let adhesive cure for 24 hours before hanging

Enjoy your shadow box art!
`;
    }
    
    reset() {
        this.uploadedImage = null;
        this.imageData = null;
        this.layers = [];
        
        document.getElementById('uploadZone').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('settingsSection').style.display = 'none';
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('imageInput').value = '';
        
        // Reset progress
        document.getElementById('progressFill').style.width = '0%';
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ShadowBoxGenerator();
});
