import { useState, useEffect } from 'react';
import Viewer3D from './components/Viewer3D';
import ARViewer from './components/ARViewer';

function App() {
  const [currentMode, setCurrentMode] = useState('viewer');
  const [modelUrl, setModelUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    // Check AR support
    const checkARSupport = async () => {
      if (navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setArSupported(supported);
        } catch (err) {
          console.error('Error checking AR support:', err);
          setArSupported(false);
        }
      }
    };
    checkARSupport();

    // Automatically load model on app start
    loadDefaultModel();
  }, []);

  const loadDefaultModel = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to load view_glb.glb first, fallback to sample file
      let url = '/view_glb.glb';
      
      // Check if view_glb.glb exists
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        // Fallback to sample file
        url = '/sample_2026-02-14T062626.936.glb';
      }

      setModelUrl(url);
      setLoading(false);
    } catch (err) {
      console.error('Error loading model:', err);
      setError('Failed to load 3D model');
      setLoading(false);
    }
  };

  const handleModeSwitch = (mode) => {
    if (mode === currentMode) return;
    setCurrentMode(mode);
  };

  const handleModelLoaded = (info) => {
    console.log('Model loaded:', info);
  };

  const handleError = (err) => {
    setError(err.message || 'An error occurred');
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>3D AR Viewer</h1>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${currentMode === 'viewer' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('viewer')}
          >
            3D Viewer
          </button>
          <button
            className={`mode-btn ${currentMode === 'ar' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('ar')}
            disabled={!arSupported}
            title={!arSupported ? 'AR not supported on this device' : ''}
          >
            AR Mode
          </button>
        </div>
      </header>

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading model...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Viewer Content */}
      {!loading && modelUrl && (
        <>
          {currentMode === 'viewer' ? (
            <Viewer3D
              modelUrl={modelUrl}
              onModelLoaded={handleModelLoaded}
              onError={handleError}
            />
          ) : (
            <ARViewer
              modelUrl={modelUrl}
              onError={handleError}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;

