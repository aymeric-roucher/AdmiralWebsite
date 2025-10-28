// 3D Viewer setup
let scene, camera, renderer, controls;
let shipModel;
let asciiEffect;
let animationFrames = [];
let previewInterval = null;

// Initialize 3D viewer
function init3DViewer() {
    const container = document.getElementById('viewer-3d');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 20, 60);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lights - sharp sun-like lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Main directional light (sun) - will be positioned by controls
    window.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    scene.add(window.sunLight);

    // Subtle fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight.position.set(-50, 20, -30);
    scene.add(fillLight);

    // Initialize light position
    updateLightPosition();

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Handle resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    updateCameraDisplay();
}

// Update camera display values
function updateCameraDisplay() {
    if (!camera) return;

    // Calculate distance from origin
    const distance = camera.position.length();
    document.getElementById('camDist').textContent = distance.toFixed(1);

    // Calculate azimuth (rotation around Y axis)
    const azimuth = Math.atan2(camera.position.x, camera.position.z) * 180 / Math.PI;
    document.getElementById('camAzimuth').textContent = azimuth.toFixed(1) + '°';

    // Calculate elevation (angle from XZ plane)
    const elevation = Math.asin(camera.position.y / distance) * 180 / Math.PI;
    document.getElementById('camElevation').textContent = elevation.toFixed(1) + '°';

    // Update zoom slider to reflect current zoom level
    updateZoomSliderFromCamera();
}

let baseDistance = null;

function updateZoomSliderFromCamera() {
    if (!camera) return;

    // Store initial distance as base
    if (baseDistance === null && shipModel) {
        baseDistance = camera.position.length();
    }

    if (baseDistance) {
        const currentDistance = camera.position.length();
        const zoomValue = baseDistance / currentDistance;
        document.getElementById('zoomSlider').value = zoomValue;
        document.getElementById('zoomValue').textContent = zoomValue.toFixed(2) + 'x';
    }
}

// Load ship model
function loadShipModel(file) {
    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    reader.onload = function(e) {
        const contents = e.target.result;

        if (extension === 'glb' || extension === 'gltf') {
            const loader = new THREE.GLTFLoader();
            loader.parse(contents, '', function(gltf) {
                setupModel(gltf.scene);
            }, function(error) {
                updateStatus('Error loading model: ' + error.message);
            });
        } else if (extension === 'stl') {
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(contents);
            const material = new THREE.MeshStandardMaterial({
                color: 0x808080,
                flatShading: true,
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geometry, material);
            setupModel(mesh);
        }
    };

    if (extension === 'glb') {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function setupModel(model) {
    // Remove old model
    if (shipModel) {
        scene.remove(shipModel);
    }

    shipModel = model;

    // Apply material to all meshes with high contrast
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                flatShading: true,
                side: THREE.DoubleSide,
                roughness: 0.8,
                metalness: 0.2
            });
        }
    });

    // Center model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    scene.add(model);

    // Update camera
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(0, maxDim, maxDim * 2);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();

    // Set base distance for zoom calculations
    baseDistance = camera.position.length();

    // Apply default zoom
    const defaultZoom = 2.05;
    document.getElementById('zoomSlider').value = defaultZoom;
    document.getElementById('zoomValue').textContent = defaultZoom.toFixed(2) + 'x';

    // Apply zoom to camera
    const currentPos = camera.position.clone();
    const newDistance = baseDistance / defaultZoom;
    currentPos.normalize();
    currentPos.multiplyScalar(newDistance);
    camera.position.copy(currentPos);
    controls.update();

    updateStatus('✓ Model loaded! Adjust parameters and generate frames.');
    document.getElementById('generateBtn').disabled = false;
}

// Generate ASCII frames
async function generateFrames() {
    if (!shipModel) {
        alert('Please load a model first!');
        return;
    }

    const numFrames = parseInt(document.getElementById('numFrames').value);
    const travelDistance = parseFloat(document.getElementById('startDist').value);
    const asciiWidth = parseInt(document.getElementById('asciiWidth').value);
    const characters = document.getElementById('asciiChars').value;
    const animStyle = document.querySelector('input[name="animStyle"]:checked').value;

    animationFrames = [];
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('downloadBtn').disabled = true;

    // Create temporary ASCII effect for capturing
    const tempRenderer = new THREE.WebGLRenderer();
    const renderSize = 800; // Square render
    tempRenderer.setSize(renderSize, renderSize);

    // Calculate resolution - lower values = more characters
    // Resolution is the size of each character cell in pixels
    const resolution = asciiWidth / renderSize;

    const tempEffect = new THREE.AsciiEffect(tempRenderer, characters, {
        invert: true,
        resolution: resolution
    });
    tempEffect.setSize(renderSize, renderSize);

    // Create a temporary camera with the same settings as the main camera
    const tempCamera = new THREE.PerspectiveCamera(
        camera.fov,
        1, // Square aspect ratio
        camera.near,
        camera.far
    );

    // Add to DOM temporarily
    tempEffect.domElement.style.position = 'absolute';
    tempEffect.domElement.style.left = '-9999px';
    document.body.appendChild(tempEffect.domElement);

    // Store original camera position
    const originalPos = camera.position.clone();
    const originalRot = camera.rotation.clone();

    // Store current camera position (keep it fixed)
    const fixedCameraPos = camera.position.clone();
    const fixedCameraTarget = controls.target.clone();

    // Store original ship position
    const originalShipPos = shipModel.position.clone();

    // Get ship's forward direction based on its rotation
    const shipForward = new THREE.Vector3(0, 0, -1); // Ship's default forward is -Z
    shipForward.applyEuler(shipModel.rotation);
    shipForward.normalize();

    // Calculate offset distance (how far back/forward the ship moves)
    const offsetDistance = travelDistance;

    for (let i = 0; i < numFrames; i++) {
        const t = i / (numFrames - 1);

        let shipOffset;
        if (animStyle === 'stop') {
            // Cosine ease-in: starts abrupt, smoothly decelerates to stop at center
            const easedT = Math.sin(t * Math.PI / 2);
            shipOffset = -offsetDistance + (offsetDistance * easedT);
        } else {
            // Pass through: linear motion from -offset to +offset
            shipOffset = -offsetDistance + (2 * offsetDistance * t);
        }

        // Position ship along its forward direction
        const newShipPos = originalShipPos.clone().add(
            shipForward.clone().multiplyScalar(-shipOffset)
        );

        shipModel.position.copy(newShipPos);

        // Keep temp camera fixed at the same position as main camera
        tempCamera.position.copy(fixedCameraPos);
        tempCamera.lookAt(fixedCameraTarget);

        // Render with ASCII effect using temp camera
        tempEffect.render(scene, tempCamera);

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 50));

        // Capture ASCII - AsciiEffect uses a single-cell table, look at innerHTML
        const table = tempEffect.domElement.querySelector('table');
        if (table) {
            // Debug first frame to understand structure
            if (i === 0) {
                console.log('===== DEBUG TABLE STRUCTURE =====');
                const cell = table.querySelector('td');
                if (cell) {
                    console.log('Cell innerHTML length:', cell.innerHTML.length);
                    console.log('Cell innerHTML preview:', cell.innerHTML.substring(0, 200));
                    console.log('Cell has <br> tags:', cell.innerHTML.includes('<br>'));
                }
                console.log('================================');
            }

            const cell = table.querySelector('td');
            if (cell) {
                // Check if the cell uses <br> tags for line breaks
                if (cell.innerHTML.includes('<br>')) {
                    // Split by <br> tags and clean HTML entities
                    const lines = cell.innerHTML.split(/<br\s*\/?>/i);
                    const asciiText = lines.map(line => {
                        // Create temporary element to decode HTML entities
                        const temp = document.createElement('div');
                        temp.innerHTML = line;
                        return temp.textContent || '';
                    }).join('\n');
                    animationFrames.push(asciiText);
                } else {
                    // Fallback: just use textContent (might still be one line)
                    animationFrames.push(cell.textContent || '');
                }
            }
        }

        updateStatus(`Generating frame ${i + 1}/${numFrames}...`);
    }

    // Restore camera and ship
    camera.position.copy(originalPos);
    camera.rotation.copy(originalRot);
    shipModel.position.copy(originalShipPos);
    controls.update();

    // Cleanup
    document.body.removeChild(tempEffect.domElement);

    updateStatus(`✓ Generated ${animationFrames.length} frames! Click Download JSON.`);
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('previewTotal').textContent = animationFrames.length;

    // Automatically save to animation.json
    saveAnimationJSON();

    // Start preview animation
    startPreview();
}

// Save animation to JSON file automatically
function saveAnimationJSON() {
    const data = {
        ship_name: 'victoria',
        num_frames: animationFrames.length,
        frames: animationFrames,
        generated_at: new Date().toISOString()
    };

    const jsonString = JSON.stringify(data, null, 2);
    console.log('Generated animation JSON:');
    console.log(jsonString);

    // Auto-download as animation.json
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Preview animation
function startPreview() {
    if (previewInterval) {
        clearInterval(previewInterval);
    }

    let currentFrame = 0;
    const previewContainer = document.getElementById('ascii-preview');
    const previewContent = document.getElementById('ascii-preview-content');
    const frameCounter = document.getElementById('previewFrame');

    // Calculate scale to fit the content in the container
    function scaleToFit() {
        if (animationFrames.length === 0) return;

        // Reset transform to measure natural size
        previewContent.style.transform = 'scale(1)';
        previewContent.style.fontSize = '8px';

        const containerWidth = previewContainer.clientWidth;
        const containerHeight = previewContainer.clientHeight;
        const contentWidth = previewContent.scrollWidth;
        const contentHeight = previewContent.scrollHeight;

        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY); // Scale to fit exactly, no limits

        previewContent.style.transform = `scale(${scale})`;
    }

    previewInterval = setInterval(() => {
        if (animationFrames.length === 0) {
            clearInterval(previewInterval);
            return;
        }

        previewContent.textContent = animationFrames[currentFrame];
        frameCounter.textContent = currentFrame + 1;

        currentFrame = (currentFrame + 1) % animationFrames.length;

        // Scale on first frame
        if (currentFrame === 1) {
            setTimeout(scaleToFit, 10);
        }
    }, 1000 / 8); // 8 FPS (slower preview)
}

// Download JSON
function downloadJSON() {
    const data = {
        ship_name: 'victoria',
        num_frames: animationFrames.length,
        frames: animationFrames
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'victoria_animation.json';
    a.click();
    URL.revokeObjectURL(url);

    updateStatus('✓ JSON downloaded! Save to output/ascii_frames/victoria_animation.json');
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Event listeners
document.getElementById('file-selector').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadShipModel(file);
    }
});

document.getElementById('generateBtn').addEventListener('click', generateFrames);
document.getElementById('downloadBtn').addEventListener('click', downloadJSON);

// Zoom slider control
document.getElementById('zoomSlider').addEventListener('input', (e) => {
    const zoomValue = parseFloat(e.target.value);
    document.getElementById('zoomValue').textContent = zoomValue.toFixed(2) + 'x';

    if (camera && baseDistance) {
        // Adjust camera position based on zoom relative to base distance
        const currentPos = camera.position.clone();
        const newDistance = baseDistance / zoomValue;

        currentPos.normalize();
        currentPos.multiplyScalar(newDistance);

        camera.position.copy(currentPos);
        controls.update();
    }
});

// Light position controls
function updateLightPosition() {
    if (!window.sunLight) return;

    const azimuth = parseFloat(document.getElementById('lightAzimuth').value) * Math.PI / 180;
    const elevation = parseFloat(document.getElementById('lightElevation').value) * Math.PI / 180;

    // Convert spherical to cartesian coordinates
    const distance = 100;
    const x = distance * Math.cos(elevation) * Math.sin(azimuth);
    const y = distance * Math.sin(elevation);
    const z = distance * Math.cos(elevation) * Math.cos(azimuth);

    window.sunLight.position.set(x, y, z);
}

document.getElementById('lightAzimuth').addEventListener('input', (e) => {
    document.getElementById('lightAzimuthValue').textContent = e.target.value + '°';
    updateLightPosition();
});

document.getElementById('lightElevation').addEventListener('input', (e) => {
    document.getElementById('lightElevationValue').textContent = e.target.value + '°';
    updateLightPosition();
});

// Initialize
init3DViewer();
