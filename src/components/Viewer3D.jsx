import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Viewer3D = ({ modelUrl, onModelLoaded, onError }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const animationIdRef = useRef(null);

  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Increased for brighter appearance
    rendererRef.current = renderer;

    // Initialize controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Setup lights
    setupLights(scene);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();

      // Update animations
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Update controls
      controls.update();

      // Render
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!modelUrl || !sceneRef.current) return;

    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        // Remove previous model if exists
        if (modelRef.current) {
          sceneRef.current.remove(modelRef.current);
        }

        const model = gltf.scene;
        modelRef.current = model;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);

        // Center the model
        model.position.sub(center.multiplyScalar(scale));

        sceneRef.current.add(model);

        // Setup animations if available
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixerRef.current.clipAction(clip).play();
          });
        }

        // Reset camera
        resetCamera();

        const info = {
          triangles: countTriangles(model),
          animations: gltf.animations.length,
          size: size
        };
        setModelInfo(info);

        if (onModelLoaded) {
          onModelLoaded(info);
        }
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        if (onError) {
          onError(error);
        }
      }
    );
  }, [modelUrl, onModelLoaded, onError]);

  const setupLights = (scene) => {
    // Ambient light - increased intensity for brighter base lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Directional light - main light source
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Hemisphere light - brighter ground color for better overall illumination
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x888888, 0.8);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // Point lights for better illumination from multiple angles
    const pointLight1 = new THREE.PointLight(0xffffff, 0.8);
    pointLight1.position.set(-5, 3, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.8);
    pointLight2.position.set(5, 3, 5);
    scene.add(pointLight2);

    // Additional fill light from below to reduce shadows
    const fillLight = new THREE.PointLight(0xffffff, 0.4);
    fillLight.position.set(0, -3, 0);
    scene.add(fillLight);
  };

  const countTriangles = (object) => {
    let count = 0;
    object.traverse((child) => {
      if (child.isMesh) {
        count += child.geometry.index
          ? child.geometry.index.count / 3
          : child.geometry.attributes.position.count / 3;
      }
    });
    return Math.floor(count);
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1, 3);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="viewer-container">
      <canvas ref={canvasRef} />

      {/* Controls Panel */}
      <div className="controls-panel">
        <div className="control-group">
          <button className="control-btn" onClick={resetCamera} title="Reset View">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </button>
          <button className="control-btn" onClick={toggleFullscreen} title="Fullscreen">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {modelInfo && (
        <div className="info-panel">
          <div className="info-item">
            <strong>Triangles:</strong> {modelInfo.triangles.toLocaleString()}
          </div>
          <div className="info-item">
            <strong>Animations:</strong> {modelInfo.animations}
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewer3D;

