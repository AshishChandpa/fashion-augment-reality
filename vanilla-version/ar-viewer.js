import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ARViewer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.animationId = null;
        this.xrSession = null;
        this.xrRefSpace = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        this.reticle = null;
        this.modelPlaced = false;

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            70,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.01,
            20
        );

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.xr.enabled = true;

        // Lights
        this.setupLights();

        // Create reticle (placement indicator)
        this.createReticle();
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 5, 0);
        this.scene.add(directionalLight);
    }

    createReticle() {
        const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.reticle = new THREE.Mesh(geometry, material);
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);
    }

    async loadModel(url) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                url,
                (gltf) => {
                    if (this.model) {
                        this.scene.remove(this.model);
                    }

                    this.model = gltf.scene;

                    // Scale the model appropriately for AR
                    const box = new THREE.Box3().setFromObject(this.model);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 0.5 / maxDim; // Smaller scale for AR
                    this.model.scale.multiplyScalar(scale);

                    // Setup animations if available
                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(this.model);
                        gltf.animations.forEach((clip) => {
                            this.mixer.clipAction(clip).play();
                        });
                    }

                    // Don't add to scene yet - wait for placement
                    this.model.visible = false;

                    resolve({
                        success: true,
                        animations: gltf.animations.length
                    });
                },
                undefined,
                (error) => {
                    reject(error);
                }
            );
        });
    }

    async startAR() {
        if (!navigator.xr) {
            throw new Error('WebXR not supported');
        }

        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!supported) {
            throw new Error('AR not supported on this device');
        }

        try {
            this.xrSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            });

            await this.onSessionStarted();
        } catch (error) {
            throw new Error('Failed to start AR session: ' + error.message);
        }
    }

    async onSessionStarted() {
        this.xrSession.addEventListener('end', () => this.onSessionEnded());

        await this.renderer.xr.setSession(this.xrSession);

        this.xrRefSpace = await this.xrSession.requestReferenceSpace('local-floor');

        // Start animation loop
        this.renderer.setAnimationLoop((timestamp, frame) => {
            this.onXRFrame(timestamp, frame);
        });


    onXRFrame(timestamp, frame) {
        if (!frame) return;

        const session = frame.session;
        const pose = frame.getViewerPose(this.xrRefSpace);

        // Request hit test source
        if (!this.hitTestSourceRequested && session) {
            session.requestReferenceSpace('viewer').then((referenceSpace) => {
                session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                    this.hitTestSource = source;
                });
            });
            this.hitTestSourceRequested = true;
        }

        // Perform hit test
        if (this.hitTestSource && pose && !this.modelPlaced) {
            const hitTestResults = frame.getHitTestResults(this.hitTestSource);
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const hitPose = hit.getPose(this.xrRefSpace);

                this.reticle.visible = true;
                this.reticle.matrix.fromArray(hitPose.transform.matrix);
            } else {
                this.reticle.visible = false;
            }
        }

        // Update animations
        if (this.mixer) {
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
        }

        // Render
        if (pose) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    placeModel() {
        if (!this.model || !this.reticle.visible) {
            return false;
        }

        // Place model at reticle position
        this.model.position.setFromMatrixPosition(this.reticle.matrix);
        this.model.visible = true;
        this.scene.add(this.model);

        this.reticle.visible = false;
        this.modelPlaced = true;

        return true;
    }

    resetPlacement() {
        if (this.model) {
            this.model.visible = false;
            this.scene.remove(this.model);
        }
        this.modelPlaced = false;
        this.reticle.visible = false;
    }

    onSessionEnded() {
        this.xrSession = null;
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        this.modelPlaced = false;

        if (this.model) {
            this.model.visible = false;
        }

        this.reticle.visible = false;
    }

    async endAR() {
        if (this.xrSession) {
            await this.xrSession.end();
        }
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.xrSession) {
            this.xrSession.end();
        }

        if (this.model) {
            this.scene.remove(this.model);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
    }

    isARSupported() {
        return navigator.xr && navigator.xr.isSessionSupported('immersive-ar');
    }
}
