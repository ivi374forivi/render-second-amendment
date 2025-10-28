/**
 * 3D Model Viewer Component
 * 
 * Interactive 3D visualization with assembly/disassembly capabilities,
 * customizable materials, lighting, and backgrounds.
 */

class ModelViewer3D {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element #${containerId} not found`);
    }

    // Configuration
    this.config = {
      background: options.background || '#1a1a1a',
      cameraPosition: options.cameraPosition || { x: 0, y: 5, z: 10 },
      enableControls: options.enableControls !== false,
      enableAnimations: options.enableAnimations !== false,
      ...options
    };

    // State
    this.state = {
      assemblyProgress: 1.0, // 0 = fully disassembled, 1 = fully assembled
      parts: [],
      selectedPart: null,
      isAnimating: false,
      materials: {},
      backgrounds: ['#1a1a1a', '#ffffff', '#87CEEB', '#2d3436']
    };

    this.init();
  }

  /**
   * Initialize the 3D viewer
   */
  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.background);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(
      this.config.cameraPosition.x,
      this.config.cameraPosition.y,
      this.config.cameraPosition.z
    );

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Controls setup
    if (this.config.enableControls && typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.screenSpacePanning = false;
      this.controls.minDistance = 2;
      this.controls.maxDistance = 50;
      this.controls.maxPolarAngle = Math.PI / 2;
    }

    // Lighting setup
    this.setupLighting();

    // Event listeners
    this.setupEventListeners();

    // Start render loop
    this.animate();
  }

  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    // Directional light (sun)
    this.mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.mainLight.position.set(5, 10, 7.5);
    this.mainLight.castShadow = true;
    this.mainLight.shadow.camera.near = 0.1;
    this.mainLight.shadow.camera.far = 50;
    this.mainLight.shadow.mapSize.width = 2048;
    this.mainLight.shadow.mapSize.height = 2048;
    this.scene.add(this.mainLight);

    // Fill light
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    this.fillLight.position.set(-5, 5, -5);
    this.scene.add(this.fillLight);

    // Rim light
    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    this.rimLight.position.set(0, 5, -10);
    this.scene.add(this.rimLight);
  }

  /**
   * Load STL model
   */
  async loadSTL(url, partName = 'main') {
    return new Promise((resolve, reject) => {
      const loader = new THREE.STLLoader();

      loader.load(
        url,
        (geometry) => {
          // Create material
          const material = new THREE.MeshPhongMaterial({
            color: 0x333333,
            specular: 0x111111,
            shininess: 200,
            flatShading: false
          });

          // Create mesh
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.name = partName;

          // Calculate and store centroid BEFORE centering
          geometry.computeBoundingBox();
          const centroid = new THREE.Vector3();
          geometry.boundingBox.getCenter(centroid);

          // Fixed: Store centroid as original position (not the default (0,0,0))
          mesh.userData.originalPosition = centroid.clone();
          mesh.userData.partName = partName;

          // Center geometry at origin (this is for rotation purposes)
          geometry.translate(-centroid.x, -centroid.y, -centroid.z);

          // Position mesh at centroid in world space
          mesh.position.copy(centroid);

          // Add to scene and parts list
          this.scene.add(mesh);
          this.state.parts.push(mesh);

          // Adjust camera to fit model
          this.fitCameraToModel();

          resolve(mesh);
        },
        (progress) => {
          // Fixed: Handle missing Content-Length header
          const percentComplete = progress.total > 0
            ? (progress.loaded / progress.total) * 100
            : 0;
          this.onProgress(partName, percentComplete);
        },
        (error) => {
          console.error('Error loading STL:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load multiple parts
   */
  async loadMultipleParts(parts) {
    const promises = parts.map(part => 
      this.loadSTL(part.url, part.name)
    );
    
    try {
      await Promise.all(promises);
      this.onLoadComplete();
    } catch (error) {
      this.onError(error);
    }
  }

  /**
   * Fit camera to see entire model
   */
  fitCameraToModel() {
    // Fixed: Handle empty parts array
    if (this.state.parts.length === 0) {
      console.warn('No parts to fit camera to');
      this.camera.position.set(0, 5, 10);
      this.camera.lookAt(0, 0, 0);
      if (this.controls) {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }
      return;
    }

    const box = new THREE.Box3();

    this.state.parts.forEach(part => {
      box.expandByObject(part);
    });

    // Fixed: Validate bounding box
    if (!box.isEmpty()) {
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      cameraZ *= 1.5; // Add some padding

      this.camera.position.set(center.x, center.y, center.z + cameraZ);
      this.camera.lookAt(center);

      if (this.controls) {
        this.controls.target.copy(center);
        this.controls.update();
      }
    }
  }

  /**
   * Animate assembly/disassembly
   */
  animateAssembly(targetProgress, duration = 2000) {
    if (this.state.isAnimating) return;

    this.state.isAnimating = true;
    const startProgress = this.state.assemblyProgress;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-in-out) - Fixed: Use <= for clarity and precision
      const easeProgress = progress <= 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      this.state.assemblyProgress = 
        startProgress + (targetProgress - startProgress) * easeProgress;

      this.updatePartPositions();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.state.isAnimating = false;
        this.onAnimationComplete();
      }
    };

    animate();
  }

  /**
   * Update part positions based on assembly progress
   */
  updatePartPositions() {
    this.state.parts.forEach((part, index) => {
      // Calculate disassembly offset
      const offset = (1 - this.state.assemblyProgress) * 5;
      
      // Spread parts in a pattern
      const angle = (index / this.state.parts.length) * Math.PI * 2;
      const x = Math.cos(angle) * offset;
      const y = index * offset * 0.5;
      const z = Math.sin(angle) * offset;

      // Apply position
      part.position.set(
        part.userData.originalPosition.x + x,
        part.userData.originalPosition.y + y,
        part.userData.originalPosition.z + z
      );
    });
  }

  /**
   * Change material properties
   */
  setMaterial(partName, materialConfig) {
    const part = this.state.parts.find(p => p.userData.partName === partName);
    
    if (part) {
      Object.assign(part.material, materialConfig);
      part.material.needsUpdate = true;
    }
  }

  /**
   * Change background
   */
  setBackground(color) {
    this.scene.background = new THREE.Color(color);
  }

  /**
   * Adjust lighting intensity
   */
  setLightIntensity(lightName, intensity) {
    const lightMap = {
      ambient: this.ambientLight,
      main: this.mainLight,
      fill: this.fillLight,
      rim: this.rimLight
    };

    const light = lightMap[lightName];
    if (light) {
      light.intensity = intensity;
    }
  }

  /**
   * Select a part
   */
  selectPart(partName) {
    // Deselect previous
    if (this.state.selectedPart) {
      this.state.selectedPart.material.emissive.setHex(0x000000);
    }

    // Select new
    const part = this.state.parts.find(p => p.userData.partName === partName);
    if (part) {
      part.material.emissive.setHex(0x444444);
      this.state.selectedPart = part;
      this.onPartSelected(part);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.renderer.domElement.addEventListener('click', (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.state.parts);

      if (intersects.length > 0) {
        this.selectPart(intersects[0].object.userData.partName);
      }
    });
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Callback methods (can be overridden)
   */
  onProgress(partName, percent) {
    console.log(`Loading ${partName}: ${percent.toFixed(2)}%`);
  }

  onLoadComplete() {
    console.log('All parts loaded');
  }

  onError(error) {
    console.error('Viewer error:', error);
  }

  onPartSelected(part) {
    console.log('Part selected:', part.userData.partName);
  }

  onAnimationComplete() {
    console.log('Animation complete');
  }

  /**
   * Cleanup
   */
  dispose() {
    this.state.parts.forEach(part => {
      part.geometry.dispose();
      part.material.dispose();
    });

    this.renderer.dispose();
    
    if (this.controls) {
      this.controls.dispose();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModelViewer3D;
}
