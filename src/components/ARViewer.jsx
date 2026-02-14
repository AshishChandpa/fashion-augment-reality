import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ARViewer = ({ modelUrl, onError }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const xrSessionRef = useRef(null);
  const xrRefSpaceRef = useRef(null);
  const hitTestSourceRef = useRef(null);
  const hitTestSourceRequestedRef = useRef(false);
  const reticleRef = useRef(null);
  const [modelPlaced, setModelPlaced] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [arReady, setArReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      70,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      20
    );
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    rendererRef.current = renderer;

    // Setup lights
    setupLights(scene);

    // Create reticle
    createReticle(scene);

    // Cleanup
    return () => {
      if (xrSessionRef.current) {
        xrSessionRef.current.end();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!modelUrl || !sceneRef.current) return;

    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
        }

        const model = gltf.scene;
        modelRef.current = model;

        // Scale the model appropriately for AR
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.5 / maxDim;
        model.scale.multiplyScalar(scale);

        // Setup animations if available
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixerRef.current.clipAction(clip).play();
          });
        }

        // Don't add to scene yet - wait for placement
        model.visible = false;

        // Start AR session
        startAR();
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        if (onError) {
          onError(error);
        }
      }
    );
  }, [modelUrl, onError]);

  const setupLights = (scene) => {
    // Bright ambient light for AR environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Directional light from above
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 5, 0);
    scene.add(directionalLight);

    // Additional point lights for better illumination in AR
    const pointLight1 = new THREE.PointLight(0xffffff, 0.6);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.6);
    pointLight2.position.set(-2, 2, -2);
    scene.add(pointLight2);
  };

  const createReticle = (scene) => {
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const reticle = new THREE.Mesh(geometry, material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
    reticleRef.current = reticle;
  };

  const startAR = async () => {
    if (!navigator.xr) {
      if (onError) {
        onError(new Error('WebXR not supported'));
      }
      return;
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-ar');
      if (!supported) {
        if (onError) {
          onError(new Error('AR not supported on this device'));
        }
        return;
      }

      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      });

      xrSessionRef.current = session;
      session.addEventListener('end', onSessionEnded);

      await rendererRef.current.xr.setSession(session);

      xrRefSpaceRef.current = await session.requestReferenceSpace('local-floor');

      setArReady(true);

      // Start animation loop
      rendererRef.current.setAnimationLoop(onXRFrame);
    } catch (error) {
      console.error('Failed to start AR session:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  const onXRFrame = (timestamp, frame) => {
    if (!frame) return;

    const session = frame.session;
    const pose = frame.getViewerPose(xrRefSpaceRef.current);

    // Request hit test source
    if (!hitTestSourceRequestedRef.current && session) {
      session.requestReferenceSpace('viewer').then((referenceSpace) => {
        session.requestHitTestSource({ space: referenceSpace }).then((source) => {
          hitTestSourceRef.current = source;
        });
      });
      hitTestSourceRequestedRef.current = true;
    }

    // Perform hit test
    if (hitTestSourceRef.current && pose && !modelPlaced) {
      const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const hitPose = hit.getPose(xrRefSpaceRef.current);

        if (reticleRef.current) {
          reticleRef.current.visible = true;
          reticleRef.current.matrix.fromArray(hitPose.transform.matrix);
        }
      } else if (reticleRef.current) {
        reticleRef.current.visible = false;
      }
    }

    // Update animations
    if (mixerRef.current) {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
    }

    // Render
    if (pose && rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const placeModel = () => {
    if (!modelRef.current || !reticleRef.current || !reticleRef.current.visible) {
      return;
    }

    // Place model at reticle position
    modelRef.current.position.setFromMatrixPosition(reticleRef.current.matrix);
    modelRef.current.visible = true;
    sceneRef.current.add(modelRef.current);

    reticleRef.current.visible = false;
    setModelPlaced(true);
    setShowInstructions(false);
  };

  const resetPlacement = () => {
    if (modelRef.current) {
      modelRef.current.visible = false;
      sceneRef.current.remove(modelRef.current);
    }
    setModelPlaced(false);
    setShowInstructions(true);
    if (reticleRef.current) {
      reticleRef.current.visible = false;
    }
  };

  const onSessionEnded = () => {
    xrSessionRef.current = null;
    hitTestSourceRef.current = null;
    hitTestSourceRequestedRef.current = false;
    setModelPlaced(false);
    setArReady(false);

    if (modelRef.current) {
      modelRef.current.visible = false;
    }

    if (reticleRef.current) {
      reticleRef.current.visible = false;
    }
  };

  const exitAR = async () => {
    if (xrSessionRef.current) {
      await xrSessionRef.current.end();
    }
  };

  return (
    <div ref={containerRef} className="ar-container">
      <canvas ref={canvasRef} />

      {/* AR Controls */}
      <div className="ar-controls">
        <button
          className="ar-btn"
          onClick={modelPlaced ? resetPlacement : placeModel}
        >
          {modelPlaced ? 'Reset Placement' : 'Place Model'}
        </button>
        <button className="ar-btn secondary" onClick={exitAR}>
          Exit AR
        </button>
      </div>

      {/* AR Instructions */}
      {showInstructions && arReady && (
        <div className="ar-instructions">
          <p>Point your camera at a flat surface and tap "Place Model"</p>
        </div>
      )}
    </div>
  );
};

export default ARViewer;

