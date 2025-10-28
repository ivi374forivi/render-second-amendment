/**
 * 3D Viewer Application
 * Handles UI interactions and integrates with ModelViewer3D
 */

(function() {
  'use strict';

  let viewer = null;
  const state = {
    currentModel: null,
    models: []
  };

  /**
   * Initialize application
   */
  function init() {
    // Initialize 3D viewer
    try {
      viewer = new ModelViewer3D('viewer3d', {
        background: '#1a1a1a',
        enableControls: true,
        enableAnimations: true
      });

      // Override callback methods
      viewer.onProgress = handleProgress;
      viewer.onLoadComplete = handleLoadComplete;
      viewer.onError = handleError;
      viewer.onPartSelected = handlePartSelected;
      viewer.onAnimationComplete = handleAnimationComplete;

      setupEventListeners();
      loadAvailableModels();
    } catch (error) {
      showError('Failed to initialize 3D viewer: ' + error.message);
    }
  }

  /**
   * Setup UI event listeners
   */
  function setupEventListeners() {
    // Model loading
    $('#loadModel').on('click', loadSelectedModel);
    $('#modelSelect').on('change', function() {
      if ($(this).val()) {
        $('#loadModel').prop('disabled', false);
      }
    });

    // Assembly controls - Fixed: Prevent race conditions during animation
    $('#assemblySlider').on('input', function() {
      if (viewer && !viewer.state.isAnimating) {
        const progress = parseFloat($(this).val()) / 100;
        viewer.state.assemblyProgress = progress;
        viewer.updatePartPositions();
      }
    });

    $('#assembleBtn').on('click', function() {
      if (viewer && !viewer.state.isAnimating) {
        // Disable controls during animation
        $('#assemblySlider').prop('disabled', true);
        $('#assembleBtn').prop('disabled', true);
        $('#disassembleBtn').prop('disabled', true);

        viewer.animateAssembly(1.0);
        $('#assemblySlider').val(100);
      }
    });

    $('#disassembleBtn').on('click', function() {
      if (viewer && !viewer.state.isAnimating) {
        // Disable controls during animation
        $('#assemblySlider').prop('disabled', true);
        $('#assembleBtn').prop('disabled', true);
        $('#disassembleBtn').prop('disabled', true);

        viewer.animateAssembly(0.0);
        $('#assemblySlider').val(0);
      }
    });

    // View controls
    $('#frontView').on('click', () => setView('front'));
    $('#sideView').on('click', () => setView('side'));
    $('#topView').on('click', () => setView('top'));
    $('#isoView').on('click', () => setView('iso'));

    // Background colors
    $('.color-btn').on('click', function() {
      const color = $(this).data('color');
      if (viewer) {
        viewer.setBackground(color);
      }
      $('.color-btn').removeClass('active');
      $(this).addClass('active');
    });

    // Lighting controls
    $('#ambientLight').on('input', function() {
      const intensity = parseFloat($(this).val()) / 100;
      if (viewer) {
        viewer.setLightIntensity('ambient', intensity);
      }
    });

    $('#mainLight').on('input', function() {
      const intensity = parseFloat($(this).val()) / 100;
      if (viewer) {
        viewer.setLightIntensity('main', intensity);
      }
    });

    $('#fillLight').on('input', function() {
      const intensity = parseFloat($(this).val()) / 100;
      if (viewer) {
        viewer.setLightIntensity('fill', intensity);
      }
    });

    // Material controls - Fixed: Add color validation
    $('#materialColor').on('change', function() {
      const color = $(this).val();

      // Fixed: Validate hex color format
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      if (!hexColorRegex.test(color)) {
        console.error('Invalid hex color:', color);
        return;
      }

      if (viewer && viewer.state.parts.length > 0) {
        try {
          const colorValue = parseInt(color.replace('#', '0x'), 16);

          if (isNaN(colorValue)) {
            console.error('Failed to parse color:', color);
            return;
          }

          viewer.state.parts.forEach(part => {
            viewer.setMaterial(part.userData.partName, {
              color: colorValue
            });
          });
        } catch (err) {
          console.error('Error setting material color:', err);
        }
      }
    });

    $('#shininess').on('input', function() {
      const shininess = parseFloat($(this).val()) * 2;
      if (viewer && viewer.state.parts.length > 0) {
        viewer.state.parts.forEach(part => {
          viewer.setMaterial(part.userData.partName, { shininess });
        });
      }
    });

    $('#metalness').on('input', function() {
      const metalness = parseFloat($(this).val()) / 100;
      // This would require changing to MeshStandardMaterial
      console.log('Metalness:', metalness);
    });

    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
      if (e.key === ' ') {
        e.preventDefault();
        const currentProgress = viewer.state.assemblyProgress;
        viewer.animateAssembly(currentProgress > 0.5 ? 0 : 1);
      }
    });
  }

  /**
   * Load available models from the repository
   */
  function loadAvailableModels() {
    // In a real implementation, this would fetch from the API
    // For now, we'll use a demo model
    state.models = [
      {
        id: 'sample',
        name: 'Sample Model (Demo)',
        parts: [
          {
            name: 'frame',
            url: 'models/sample/frame.stl'
          }
        ]
      }
    ];

    // Populate dropdown
    const $select = $('#modelSelect');
    state.models.forEach(model => {
      $select.append(
        $('<option>')
          .val(model.id)
          .text(model.name)
      );
    });
  }

  /**
   * Load selected model
   */
  async function loadSelectedModel() {
    const modelId = $('#modelSelect').val();
    if (!modelId) return;

    const model = state.models.find(m => m.id === modelId);
    if (!model) return;

    showLoading();

    try {
      // Fixed: Comprehensive cleanup to prevent memory leaks
      if (viewer.state.parts.length > 0) {
        // Clear selection first
        if (viewer.state.selectedPart) {
          viewer.state.selectedPart.material.emissive.setHex(0x000000);
          viewer.state.selectedPart = null;
        }

        // Dispose all parts
        viewer.state.parts.forEach(part => {
          viewer.scene.remove(part);

          // Dispose geometry
          if (part.geometry) {
            part.geometry.dispose();
          }

          // Dispose material and textures
          if (part.material) {
            // Dispose textures if any
            if (part.material.map) part.material.map.dispose();
            if (part.material.normalMap) part.material.normalMap.dispose();
            if (part.material.roughnessMap) part.material.roughnessMap.dispose();
            if (part.material.metalnessMap) part.material.metalnessMap.dispose();

            part.material.dispose();
          }
        });

        viewer.state.parts = [];
      }

      // Load new model parts
      if (model.parts && model.parts.length > 0) {
        await viewer.loadMultipleParts(model.parts);
      } else {
        // Demo: Create a simple box if no STL files
        createDemoModel();
      }

      state.currentModel = model;
      updateModelInfo(model);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * Create a demo model (for testing without STL files)
   */
  function createDemoModel() {
    hideLoading();

    // Create multiple parts for demo
    const parts = [
      { name: 'Lower', position: [0, 0, 0], color: 0x333333 },
      { name: 'Upper', position: [0, 1.5, 0], color: 0x444444 },
      { name: 'Barrel', position: [0, 1.5, 2], color: 0x555555 },
      { name: 'Grip', position: [0, -0.5, -0.3], color: 0x222222 }
    ];

    parts.forEach((partConfig, index) => {
      const geometry = new THREE.BoxGeometry(1, 1, 2);
      const material = new THREE.MeshPhongMaterial({
        color: partConfig.color,
        specular: 0x111111,
        shininess: 200
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...partConfig.position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = partConfig.name;
      mesh.userData.originalPosition = mesh.position.clone();
      mesh.userData.partName = partConfig.name;

      viewer.scene.add(mesh);
      viewer.state.parts.push(mesh);
    });

    viewer.fitCameraToModel();

    updateModelInfo({
      name: 'Demo Model',
      parts: parts.map(p => ({ name: p.name }))
    });
  }

  /**
   * Set camera view
   * Fixed: Add null check for controls and fallback behavior
   */
  function setView(view) {
    if (!viewer) return;

    // Fixed: Add null check for controls with fallback
    if (!viewer.controls) {
      console.warn('Orbit controls not available');
      // Fallback to direct camera positioning
      const distance = 10;
      let position;
      switch (view) {
        case 'front':
          position = new THREE.Vector3(0, 0, distance);
          break;
        case 'side':
          position = new THREE.Vector3(distance, 0, 0);
          break;
        case 'top':
          position = new THREE.Vector3(0, distance, 0);
          break;
        case 'iso':
        default:
          position = new THREE.Vector3(distance * 0.7, distance * 0.7, distance * 0.7);
      }
      viewer.camera.position.copy(position);
      viewer.camera.lookAt(0, 0, 0);
      return;
    }

    const target = viewer.controls.target.clone();
    const distance = 10;

    let position;
    switch (view) {
      case 'front':
        position = new THREE.Vector3(target.x, target.y, target.z + distance);
        break;
      case 'side':
        position = new THREE.Vector3(target.x + distance, target.y, target.z);
        break;
      case 'top':
        position = new THREE.Vector3(target.x, target.y + distance, target.z);
        break;
      case 'iso':
      default:
        position = new THREE.Vector3(
          target.x + distance * 0.7,
          target.y + distance * 0.7,
          target.z + distance * 0.7
        );
    }

    // Animate camera transition
    const startPosition = viewer.camera.position.clone();
    const duration = 1000;
    const startTime = Date.now();

    function animateCamera() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out - Fixed: Use <= for clarity and precision
      const easeProgress = progress <= 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      viewer.camera.position.lerpVectors(startPosition, position, easeProgress);
      viewer.camera.lookAt(target);

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        if (viewer.controls) {
          viewer.controls.update();
        }
      }
    }

    animateCamera();
  }

  /**
   * Update model information display
   */
  function updateModelInfo(model) {
    const html = `
      <p><strong>Model:</strong> ${model.name}</p>
      <p><strong>Parts:</strong> ${model.parts ? model.parts.length : 0}</p>
      <p><strong>Status:</strong> Loaded</p>
    `;
    $('#modelInfo').html(html);
  }

  /**
   * Show loading indicator
   */
  function showLoading() {
    $('#loadingIndicator').show();
    $('#errorMessage').hide();
  }

  /**
   * Hide loading indicator
   */
  function hideLoading() {
    $('#loadingIndicator').hide();
  }

  /**
   * Show error message
   */
  function showError(message) {
    hideLoading();
    $('#errorMessage').text(message).show();
    setTimeout(() => {
      $('#errorMessage').fadeOut();
    }, 5000);
  }

  /**
   * Callback handlers
   */
  function handleProgress(partName, percent) {
    $('#loadingIndicator p').text(`Loading ${partName}: ${percent.toFixed(0)}%`);
  }

  function handleLoadComplete() {
    hideLoading();
    console.log('Model loaded successfully');
  }

  function handleError(error) {
    showError('Error loading model: ' + error.message);
    console.error('Viewer error:', error);
  }

  function handlePartSelected(part) {
    const html = `
      <p><strong>Part:</strong> ${part.userData.partName}</p>
      <p><strong>Position:</strong> 
        X: ${part.position.x.toFixed(2)}, 
        Y: ${part.position.y.toFixed(2)}, 
        Z: ${part.position.z.toFixed(2)}
      </p>
      <p><strong>Selected:</strong> Click to deselect</p>
    `;
    $('#partDetails').html(html);
  }

  function handleAnimationComplete() {
    const progress = viewer.state.assemblyProgress;
    $('#assemblySlider').val(progress * 100);

    // Fixed: Re-enable controls after animation
    $('#assemblySlider').prop('disabled', false);
    $('#assembleBtn').prop('disabled', false);
    $('#disassembleBtn').prop('disabled', false);
  }

  // Initialize when DOM is ready
  $(document).ready(init);

})();
