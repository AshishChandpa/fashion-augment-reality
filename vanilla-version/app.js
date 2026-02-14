import { Viewer3D } from './viewer.js';
import { ARViewer } from './ar-viewer.js';

class App {
    constructor() {
        this.viewer3D = null;
        this.arViewer = null;
        this.currentMode = 'viewer'; // 'viewer' or 'ar'
        this.currentModelUrl = null;

        this.init();
    }

    init() {
        // Get DOM elements
        this.elements = {
            uploadSection: document.getElementById('uploadSection'),
            fileInput: document.getElementById('fileInput'),
            loadSampleBtn: document.getElementById('loadSampleBtn'),
            viewerContainer: document.getElementById('viewerContainer'),
            arContainer: document.getElementById('arContainer'),
            viewerCanvas: document.getElementById('viewerCanvas'),
            arCanvas: document.getElementById('arCanvas'),
            viewerModeBtn: document.getElementById('viewerModeBtn'),
            arModeBtn: document.getElementById('arModeBtn'),
            resetBtn: document.getElementById('resetBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            placeModelBtn: document.getElementById('placeModelBtn'),
            exitArBtn: document.getElementById('exitArBtn'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorMessage: document.getElementById('errorMessage'),
            modelInfo: document.getElementById('modelInfo'),
            arInstructions: document.getElementById('arInstructions')
        };

        // Initialize viewers
        this.viewer3D = new Viewer3D(this.elements.viewerCanvas);
        this.arViewer = new ARViewer(this.elements.arCanvas);

        // Setup event listeners
        this.setupEventListeners();

        // Check AR support
        this.checkARSupport();
    }

    setupEventListeners() {
        // File upload
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.elements.loadSampleBtn.addEventListener('click', () => this.loadSampleModel());

        // Mode switching
        this.elements.viewerModeBtn.addEventListener('click', () => this.switchMode('viewer'));
        this.elements.arModeBtn.addEventListener('click', () => this.switchMode('ar'));

        // Viewer controls
        this.elements.resetBtn.addEventListener('click', () => this.resetView());
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // AR controls
        this.elements.placeModelBtn.addEventListener('click', () => this.placeARModel());
        this.elements.exitArBtn.addEventListener('click', () => this.exitAR());
    }

    async checkARSupport() {
        if (!navigator.xr) {
            this.elements.arModeBtn.disabled = true;
            this.elements.arModeBtn.title = 'AR not supported on this device';
            return;
        }

        try {
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            if (!supported) {
                this.elements.arModeBtn.disabled = true;
                this.elements.arModeBtn.title = 'AR not supported on this device';
            }
        } catch (error) {
            console.error('Error checking AR support:', error);
            this.elements.arModeBtn.disabled = true;
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
            this.showError('Please upload a .glb or .gltf file');
            return;
        }

        const url = URL.createObjectURL(file);
        await this.loadModel(url);
    }

    async loadSampleModel() {
        // Look for sample .glb file in the directory
        const sampleFile = 'sample_2026-02-14T062626.936.glb';
        await this.loadModel(sampleFile);
    }

    async loadModel(url) {
        this.showLoading(true);
        this.hideError();

        try {
            this.currentModelUrl = url;

            if (this.currentMode === 'viewer') {
                const info = await this.viewer3D.loadModel(url);
                this.showModelInfo(info);
                this.showViewer();
            } else {
                await this.arViewer.loadModel(url);
                this.showAR();
            }

            this.showLoading(false);
        } catch (error) {
            console.error('Error loading model:', error);
            this.showError('Failed to load model: ' + error.message);
            this.showLoading(false);
        }
    }

    showModelInfo(info) {
        this.elements.modelInfo.innerHTML = `
            <div class="info-item">
                <strong>Triangles:</strong> ${info.triangles.toLocaleString()}
            </div>
            <div class="info-item">
                <strong>Animations:</strong> ${info.animations}
            </div>
        `;
    }

    async switchMode(mode) {
        if (mode === this.currentMode) return;

        this.currentMode = mode;

        // Update button states
        this.elements.viewerModeBtn.classList.toggle('active', mode === 'viewer');
        this.elements.arModeBtn.classList.toggle('active', mode === 'ar');

        if (mode === 'viewer') {
            await this.exitAR();
            if (this.currentModelUrl) {
                await this.loadModel(this.currentModelUrl);
            }
        } else {
            this.hideViewer();
            if (this.currentModelUrl) {
                await this.loadModel(this.currentModelUrl);
            }
        }
    }

    showViewer() {
        this.elements.uploadSection.style.display = 'none';
        this.elements.viewerContainer.style.display = 'block';
        this.elements.arContainer.style.display = 'none';
    }

    hideViewer() {
        this.elements.viewerContainer.style.display = 'none';
    }

    async showAR() {
        this.elements.uploadSection.style.display = 'none';
        this.elements.viewerContainer.style.display = 'none';
        this.elements.arContainer.style.display = 'block';

        try {
            await this.arViewer.startAR();
            this.elements.arInstructions.style.display = 'block';
        } catch (error) {
            console.error('Error starting AR:', error);
            this.showError('Failed to start AR: ' + error.message);
            this.switchMode('viewer');
        }
    }

    placeARModel() {
        const placed = this.arViewer.placeModel();
        if (placed) {
            this.elements.arInstructions.style.display = 'none';
            this.elements.placeModelBtn.textContent = 'Reset Placement';
            this.elements.placeModelBtn.onclick = () => {
                this.arViewer.resetPlacement();
                this.elements.arInstructions.style.display = 'block';
                this.elements.placeModelBtn.textContent = 'Place Model';
                this.elements.placeModelBtn.onclick = () => this.placeARModel();
            };
        }
    }

    async exitAR() {
        if (this.arViewer.xrSession) {
            await this.arViewer.endAR();
        }
        this.elements.arContainer.style.display = 'none';
    }

    resetView() {
        if (this.currentMode === 'viewer') {
            this.viewer3D.resetCamera();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.elements.viewerContainer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    showLoading(show) {
        this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
