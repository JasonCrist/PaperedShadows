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
        
        // Annotation system
        this.annotationData = null;
        this.currentDepthTool = 'foreground';
        this.brushSize = 40;
        this.isDrawing = false;
        
        // Refinement system
        this.layerHistory = [];
        this.currentHistoryIndex = -1;
        this.selectedLayerIndex = 0;
        
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
        
        // Annotation tools
        this.setupAnnotationTools();
        
        // Refinement tools
        this.setupRefinementTools();
    }
    
    setupAnnotationTools() {
        const foregroundTool = document.getElementById('foregroundTool');
        const backgroundTool = document.getElementById('backgroundTool');
        const middleTool = document.getElementById('middleTool');
        const brushSizeSlider = document.getElementById('brushSize');
        const clearBtn = document.getElementById('clearAnnotations');
        const toggleOverlayBtn = document.getElementById('toggleDepthOverlay');
        const skipBtn = document.getElementById('skipAnnotation');
        const continueBtn = document.getElementById('continueToSettings');
        
        [foregroundTool, backgroundTool, middleTool].forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn[data-depth]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDepthTool = btn.dataset.depth;
            });
        });
        
        brushSizeSlider.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = `${this.brushSize}px`;
        });
        
        clearBtn.addEventListener('click', () => {
            this.clearAnnotations();
        });
        
        toggleOverlayBtn.addEventListener('click', () => {
            const overlay = document.getElementById('depthOverlayCanvas');
            overlay.classList.toggle('visible');
        });
        
        skipBtn.addEventListener('click', () => {
            this.annotationData = null;
            this.showSettings();
            document.getElementById('annotationSection').style.display = 'none';
        });
        
        continueBtn.addEventListener('click', () => {
            this.showSettings();
            document.getElementById('annotationSection').style.display = 'none';
        });
    }
    
    setupRefinementTools() {
        const layerSelect = document.getElementById('layerSelect');
        const simplifyBtn = document.getElementById('simplifyBtn');
        const addDetailBtn = document.getElementById('addDetailBtn');
        const smoothBtn = document.getElementById('smoothBtn');
        const removeSmallBtn = document.getElementById('removeSmallBtn');
        const undoBtn = document.getElementById('undoBtn');
        
        layerSelect.addEventListener('change', (e) => {
            this.selectedLayerIndex = parseInt(e.target.value);
            this.updateRefinementPreview();
        });
        
        simplifyBtn.addEventListener('click', () => {
            this.simplifyLayer(this.selectedLayerIndex);
        });
        
        addDetailBtn.addEventListener('click', () => {
            this.addDetailToLayer(this.selectedLayerIndex);
        });
        
        smoothBtn.addEventListener('click', () => {
            this.smoothLayer(this.selectedLayerIndex);
        });
        
        removeSmallBtn.addEventListener('click', () => {
            this.removeSmallArtifacts(this.selectedLayerIndex);
        });
        
        undoBtn.addEventListener('click', () => {
            this.undoRefinement();
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
        
        // Show annotation section
        this.showAnnotation();
    }
    
    showAnnotation() {
        document.getElementById('annotationSection').style.display = 'block';
        this.initializeAnnotationCanvas();
    }
    
    initializeAnnotationCanvas() {
        const canvas = document.getElementById('annotationCanvas');
        const overlayCanvas = document.getElementById('depthOverlayCanvas');
        const ctx = canvas.getContext('2d');
        const overlayCtx = overlayCanvas.getContext('2d');
        
        // Size canvas to fit image
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
        overlayCanvas.width = width;
        overlayCanvas.height = height;
        
        // Draw image
        ctx.drawImage(this.uploadedImage, 0, 0, width, height);
        
        // Initialize annotation data
        this.annotationData = new Float32Array(width * height);
        this.annotationData.fill(0.5); // 0.5 = unspecified (middle depth)
        
        // Set up drawing
        this.setupCanvasDrawing(canvas);
        
        // Generate initial depth map overlay
        this.updateDepthOverlay(overlayCanvas, overlayCtx);
    }
    
    setupCanvasDrawing(canvas) {
        const ctx = canvas.getContext('2d');
        
        const getMousePos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };
        
        const getTouchPos = (e) => {
            if (e.touches.length === 0) return null;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        };
        
        const draw = (x, y) => {
            const radius = this.brushSize / 2;
            const depthValue = this.getDepthValue(this.currentDepthTool);
            const color = this.getDepthColor(this.currentDepthTool);
            
            // Draw on canvas
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            
            // Update annotation data
            const width = canvas.width;
            const height = canvas.height;
            
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= radius) {
                        const px = Math.round(x + dx);
                        const py = Math.round(y + dy);
                        
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const idx = py * width + px;
                            // Blend with existing value for smooth transitions
                            const strength = 1 - (distance / radius);
                            this.annotationData[idx] = this.annotationData[idx] * (1 - strength * 0.7) + 
                                                       depthValue * (strength * 0.7);
                        }
                    }
                }
            }
            
            // Update overlay
            const overlayCanvas = document.getElementById('depthOverlayCanvas');
            const overlayCtx = overlayCanvas.getContext('2d');
            this.updateDepthOverlay(overlayCanvas, overlayCtx);
        };
        
        canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            const pos = getMousePos(e);
            draw(pos.x, pos.y);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                const pos = getMousePos(e);
                draw(pos.x, pos.y);
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
        });
        
        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const pos = getTouchPos(e);
            if (pos) draw(pos.x, pos.y);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const pos = getTouchPos(e);
                if (pos) draw(pos.x, pos.y);
            }
        });
        
        canvas.addEventListener('touchend', () => {
            this.isDrawing = false;
        });
    }
    
    getDepthValue(tool) {
        switch (tool) {
            case 'foreground': return 1.0;
            case 'background': return 0.0;
            case 'middle': return 0.5;
            default: return 0.5;
        }
    }
    
    getDepthColor(tool) {
        switch (tool) {
            case 'foreground': return '#4a8870';
            case 'background': return '#5b7fa8';
            case 'middle': return '#d4a54c';
            default: return '#888888';
        }
    }
    
    clearAnnotations() {
        const canvas = document.getElementById('annotationCanvas');
        const ctx = canvas.getContext('2d');
        
        // Redraw original image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.uploadedImage, 0, 0, canvas.width, canvas.height);
        
        // Reset annotation data
        this.annotationData.fill(0.5);
        
        // Update overlay
        const overlayCanvas = document.getElementById('depthOverlayCanvas');
        const overlayCtx = overlayCanvas.getContext('2d');
        this.updateDepthOverlay(overlayCanvas, overlayCtx);
    }
    
    updateDepthOverlay(canvas, ctx) {
        const width = canvas.width;
        const height = canvas.height;
        const imageData = ctx.createImageData(width, height);
        
        for (let i = 0; i < this.annotationData.length; i++) {
            const depth = this.annotationData[i];
            const idx = i * 4;
            
            // Create a blue (far) to red (close) gradient
            imageData.data[idx] = depth * 255; // R
            imageData.data[idx + 1] = (1 - Math.abs(depth - 0.5) * 2) * 255; // G
            imageData.data[idx + 2] = (1 - depth) * 255; // B
            imageData.data[idx + 3] = 255; // A
        }
        
        ctx.putImageData(imageData, 0, 0);
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
        // 4. User annotations (if provided)
        
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
                
                // Automatic depth estimation
                let autoDepth = (luminance / 255) * 0.6 + positionBias * 0.4;
                
                // If we have user annotations, blend them in
                if (this.annotationData) {
                    const annotationDepth = this.annotationData[y * width + x];
                    // Give more weight to user annotations where they exist (not 0.5)
                    const annotationStrength = Math.abs(annotationDepth - 0.5) * 2;
                    depthMap[y * width + x] = autoDepth * (1 - annotationStrength) + 
                                             annotationDepth * annotationStrength;
                } else {
                    depthMap[y * width + x] = autoDepth;
                }
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
        
        // Initialize refinement
        this.initializeRefinement();
        
        // Create 3D preview
        this.create3DPreview();
        this.setup3DControls();
        
        const layerGrid = document.getElementById('layerGrid');
        layerGrid.innerHTML = '';
        
        this.layers.forEach((layer, index) => {
            const layerCard = this.createLayerCard(layer, index);
            layerGrid.appendChild(layerCard);
        });
    }
    
    initializeRefinement() {
        // Populate layer select
        const layerSelect = document.getElementById('layerSelect');
        layerSelect.innerHTML = '';
        
        this.layers.forEach((layer, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Layer ${layer.number} - ${layer.number === 1 ? 'Back' : layer.number === this.settings.numLayers ? 'Front' : 'Middle'}`;
            layerSelect.appendChild(option);
        });
        
        // Initialize history
        this.layerHistory = [this.cloneLayers()];
        this.currentHistoryIndex = 0;
        
        // Update preview
        this.updateRefinementPreview();
    }
    
    cloneLayers() {
        return this.layers.map(layer => ({
            ...layer,
            svg: layer.svg.cloneNode(true),
            svgString: layer.svgString
        }));
    }
    
    saveToHistory() {
        // Remove any future history if we're not at the end
        this.layerHistory = this.layerHistory.slice(0, this.currentHistoryIndex + 1);
        
        // Add new state
        this.layerHistory.push(this.cloneLayers());
        this.currentHistoryIndex++;
        
        // Limit history to 20 steps
        if (this.layerHistory.length > 20) {
            this.layerHistory.shift();
            this.currentHistoryIndex--;
        }
        
        // Update undo button
        document.getElementById('undoBtn').disabled = this.currentHistoryIndex === 0;
    }
    
    undoRefinement() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            this.layers = this.cloneLayers(this.layerHistory[this.currentHistoryIndex]);
            this.updateRefinementPreview();
            this.update3DPreview();
            this.updateLayerCards();
            
            document.getElementById('undoBtn').disabled = this.currentHistoryIndex === 0;
        }
    }
    
    updateRefinementPreview() {
        const layer = this.layers[this.selectedLayerIndex];
        const preview = document.getElementById('currentPreview');
        
        preview.innerHTML = '';
        preview.appendChild(layer.svg.cloneNode(true));
        
        // Update complexity info
        const pathData = layer.svg.querySelector('path').getAttribute('d');
        const points = pathData.split(/[MLZ\s]+/).filter(p => p.length > 0).length;
        
        document.getElementById('pathPointsValue').textContent = points;
        
        let complexity = 'Low';
        if (points > 100) complexity = 'Medium';
        if (points > 300) complexity = 'High';
        if (points > 600) complexity = 'Very High';
        
        document.getElementById('complexityValue').textContent = complexity;
    }
    
    simplifyLayer(index) {
        const layer = this.layers[index];
        const pathElement = layer.svg.querySelector('path');
        const pathData = pathElement.getAttribute('d');
        
        // Parse and simplify path
        const simplified = this.simplifyPath(pathData, 2.0); // Increase tolerance
        
        pathElement.setAttribute('d', simplified);
        layer.svgString = this.svgToString(layer.svg, layer.width, layer.height);
        
        this.saveToHistory();
        this.updateRefinementPreview();
        this.update3DPreview();
        this.updateLayerCards();
    }
    
    addDetailToLayer(index) {
        const layer = this.layers[index];
        const pathElement = layer.svg.querySelector('path');
        const pathData = pathElement.getAttribute('d');
        
        // Parse and add detail
        const detailed = this.subdividePath(pathData);
        
        pathElement.setAttribute('d', detailed);
        layer.svgString = this.svgToString(layer.svg, layer.width, layer.height);
        
        this.saveToHistory();
        this.updateRefinementPreview();
        this.update3DPreview();
        this.updateLayerCards();
    }
    
    smoothLayer(index) {
        const layer = this.layers[index];
        const pathElement = layer.svg.querySelector('path');
        const pathData = pathElement.getAttribute('d');
        
        // Apply smoothing
        const smoothed = this.smoothPath(pathData);
        
        pathElement.setAttribute('d', smoothed);
        layer.svgString = this.svgToString(layer.svg, layer.width, layer.height);
        
        this.saveToHistory();
        this.updateRefinementPreview();
        this.update3DPreview();
        this.updateLayerCards();
    }
    
    removeSmallArtifacts(index) {
        const layer = this.layers[index];
        const pathElement = layer.svg.querySelector('path');
        const pathData = pathElement.getAttribute('d');
        
        // Remove small disconnected paths
        const cleaned = this.removeSmallPaths(pathData, 50); // Minimum 50 points
        
        pathElement.setAttribute('d', cleaned);
        layer.svgString = this.svgToString(layer.svg, layer.width, layer.height);
        
        this.saveToHistory();
        this.updateRefinementPreview();
        this.update3DPreview();
        this.updateLayerCards();
    }
    
    simplifyPath(pathData, tolerance) {
        // Douglas-Peucker algorithm for path simplification
        const commands = pathData.match(/[MLZ][^MLZ]*/g) || [];
        const simplified = [];
        
        for (const cmd of commands) {
            if (cmd[0] === 'M') {
                simplified.push(cmd);
            } else if (cmd[0] === 'L') {
                const coords = cmd.substring(1).trim().split(/[\s,]+/);
                if (coords.length >= 2) {
                    // Keep every Nth point based on tolerance
                    const skip = Math.max(1, Math.floor(tolerance));
                    if (simplified.length % skip === 0) {
                        simplified.push(cmd);
                    }
                }
            } else if (cmd[0] === 'Z') {
                simplified.push(cmd);
            }
        }
        
        return simplified.join(' ');
    }
    
    subdividePath(pathData) {
        // Add intermediate points between existing points
        const commands = pathData.match(/[MLZ][^MLZ]*/g) || [];
        const detailed = [];
        let lastPoint = null;
        
        for (const cmd of commands) {
            if (cmd[0] === 'M') {
                const coords = cmd.substring(1).trim().split(/[\s,]+/);
                lastPoint = [parseFloat(coords[0]), parseFloat(coords[1])];
                detailed.push(cmd);
            } else if (cmd[0] === 'L') {
                const coords = cmd.substring(1).trim().split(/[\s,]+/);
                const point = [parseFloat(coords[0]), parseFloat(coords[1])];
                
                if (lastPoint) {
                    // Add midpoint
                    const midX = (lastPoint[0] + point[0]) / 2;
                    const midY = (lastPoint[1] + point[1]) / 2;
                    detailed.push(`L ${midX},${midY}`);
                }
                
                detailed.push(cmd);
                lastPoint = point;
            } else if (cmd[0] === 'Z') {
                detailed.push(cmd);
            }
        }
        
        return detailed.join(' ');
    }
    
    smoothPath(pathData) {
        // Apply moving average smoothing
        const commands = pathData.match(/[MLZ][^MLZ]*/g) || [];
        const points = [];
        
        // Extract all points
        for (const cmd of commands) {
            if (cmd[0] === 'M' || cmd[0] === 'L') {
                const coords = cmd.substring(1).trim().split(/[\s,]+/);
                if (coords.length >= 2) {
                    points.push([parseFloat(coords[0]), parseFloat(coords[1])]);
                }
            }
        }
        
        // Smooth using moving average
        const smoothed = [];
        const windowSize = 3;
        
        for (let i = 0; i < points.length; i++) {
            let sumX = 0, sumY = 0, count = 0;
            
            for (let j = Math.max(0, i - windowSize); j <= Math.min(points.length - 1, i + windowSize); j++) {
                sumX += points[j][0];
                sumY += points[j][1];
                count++;
            }
            
            smoothed.push([sumX / count, sumY / count]);
        }
        
        // Rebuild path
        let result = `M ${smoothed[0][0]},${smoothed[0][1]} `;
        for (let i = 1; i < smoothed.length; i++) {
            result += `L ${smoothed[i][0]},${smoothed[i][1]} `;
        }
        result += 'Z';
        
        return result;
    }
    
    removeSmallPaths(pathData, minSize) {
        // Split into individual paths and remove small ones
        const paths = pathData.split('Z').filter(p => p.trim().length > 0);
        const filtered = [];
        
        for (const path of paths) {
            const commands = path.match(/[ML][^ML]*/g) || [];
            if (commands.length >= minSize) {
                filtered.push(path + ' Z');
            }
        }
        
        return filtered.join(' ');
    }
    
    update3DPreview() {
        // Recreate 3D preview with updated layers
        this.create3DPreview();
    }
    
    updateLayerCards() {
        // Update individual layer cards
        const layerGrid = document.getElementById('layerGrid');
        layerGrid.innerHTML = '';
        
        this.layers.forEach((layer, index) => {
            const layerCard = this.createLayerCard(layer, index);
            layerGrid.appendChild(layerCard);
        });
    }
    
    create3DPreview() {
        const scene = document.getElementById('scene3d');
        scene.innerHTML = '';
        
        // Calculate spacing in pixels (converted from inches)
        const baseSpacing = 30; // pixels per 0.25 inches
        const spacingMultiplier = this.settings.spacing / 0.25;
        const layerSpacing = baseSpacing * spacingMultiplier;
        
        this.layers.forEach((layer, index) => {
            const layerDiv = document.createElement('div');
            layerDiv.className = 'preview-3d-layer';
            
            // Assign layer category for styling
            if (index < this.layers.length / 3) {
                layerDiv.classList.add('back-layer');
            } else if (index < (this.layers.length * 2) / 3) {
                layerDiv.classList.add('mid-layer');
            } else {
                layerDiv.classList.add('front-layer');
            }
            
            // Create a colored version for preview
            const svgClone = layer.svg.cloneNode(true);
            layerDiv.appendChild(svgClone);
            
            // Position layer with depth
            const zDepth = index * layerSpacing;
            layerDiv.style.transform = `
                translate(-50%, -50%) 
                translateZ(${zDepth}px)
            `;
            
            scene.appendChild(layerDiv);
        });
        
        // Set initial rotation
        this.update3DView(20, 15, 70);
    }
    
    setup3DControls() {
        const rotationControl = document.getElementById('rotationControl');
        const tiltControl = document.getElementById('tiltControl');
        const lightingControl = document.getElementById('lightingControl');
        const resetViewBtn = document.getElementById('resetViewBtn');
        
        const updateView = () => {
            const rotation = parseFloat(rotationControl.value);
            const tilt = parseFloat(tiltControl.value);
            const lighting = parseFloat(lightingControl.value);
            this.update3DView(rotation, tilt, lighting);
        };
        
        rotationControl.addEventListener('input', updateView);
        tiltControl.addEventListener('input', updateView);
        lightingControl.addEventListener('input', updateView);
        
        resetViewBtn.addEventListener('click', () => {
            rotationControl.value = 20;
            tiltControl.value = 15;
            lightingControl.value = 70;
            updateView();
        });
    }
    
    update3DView(rotationY, rotationX, lighting) {
        const scene = document.getElementById('scene3d');
        const container = document.getElementById('preview3d');
        
        // Update scene rotation
        scene.style.transform = `
            rotateX(${rotationX}deg)
            rotateY(${rotationY}deg)
            translateZ(-100px)
        `;
        
        // Update lighting effect
        const lightOpacity = lighting / 100;
        container.style.setProperty('--light-intensity', lightOpacity);
        
        // Add glow effect based on lighting
        const layers = scene.querySelectorAll('.preview-3d-layer svg');
        layers.forEach((svg, index) => {
            const glowIntensity = (lighting / 100) * (1 - index / layers.length);
            svg.style.filter = `
                drop-shadow(0 ${4 + glowIntensity * 8}px ${12 + glowIntensity * 20}px rgba(0,0,0,${0.3 + glowIntensity * 0.4}))
            `;
        });
    }
    
    createLayerCard(layer, index) {
        const card = document.createElement('div');
        card.className = 'layer-card';
        card.dataset.layerIndex = index;
        
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
        
        // Add hover interaction with 3D preview
        card.addEventListener('mouseenter', () => {
            this.highlight3DLayer(index);
        });
        
        card.addEventListener('mouseleave', () => {
            this.unhighlight3DLayers();
        });
        
        card.querySelector('.layer-download-btn').addEventListener('click', () => {
            this.downloadLayer(index);
        });
        
        return card;
    }
    
    highlight3DLayer(index) {
        const scene = document.getElementById('scene3d');
        const layers = scene.querySelectorAll('.preview-3d-layer');
        
        layers.forEach((layer, i) => {
            if (i === index) {
                layer.style.transform = layer.style.transform.replace('translateZ', 'scale(1.1) translateZ');
                layer.style.zIndex = '1000';
                layer.querySelector('svg').style.filter = `
                    drop-shadow(0 8px 24px rgba(212, 132, 92, 0.6))
                    drop-shadow(0 0 40px rgba(212, 132, 92, 0.4))
                `;
            } else {
                layer.style.opacity = '0.3';
            }
        });
    }
    
    unhighlight3DLayers() {
        const scene = document.getElementById('scene3d');
        const layers = scene.querySelectorAll('.preview-3d-layer');
        
        layers.forEach((layer) => {
            layer.style.transform = layer.style.transform.replace('scale(1.1) ', '');
            layer.style.zIndex = '';
            layer.style.opacity = '1';
        });
        
        // Reapply lighting effect
        const lightingControl = document.getElementById('lightingControl');
        const lighting = parseFloat(lightingControl.value);
        const svgs = scene.querySelectorAll('.preview-3d-layer svg');
        svgs.forEach((svg, index) => {
            const glowIntensity = (lighting / 100) * (1 - index / svgs.length);
            svg.style.filter = `
                drop-shadow(0 ${4 + glowIntensity * 8}px ${12 + glowIntensity * 20}px rgba(0,0,0,${0.3 + glowIntensity * 0.4}))
            `;
        });
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
        this.annotationData = null;
        this.layerHistory = [];
        this.currentHistoryIndex = -1;
        
        document.getElementById('uploadZone').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
        document.getElementById('annotationSection').style.display = 'none';
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
