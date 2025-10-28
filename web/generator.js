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

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1);
    pointLight1.position.set(100, 100, 100);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
    pointLight2.position.set(-100, -50, -100);
    scene.add(pointLight2);

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

    // Apply material to all meshes
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0x808080,
                flatShading: true,
                side: THREE.DoubleSide
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

    // Apply initial rotation from sliders
    updateShipRotation();

    updateStatus('✓ Model loaded! Adjust parameters and generate frames.');
    document.getElementById('generateBtn').disabled = false;
}

// Update ship rotation from sliders
function updateShipRotation() {
    if (!shipModel) return;

    const yawDeg = parseFloat(document.getElementById('yawSlider').value);
    const pitchDeg = parseFloat(document.getElementById('pitchSlider').value);

    const yaw = yawDeg * Math.PI / 180;
    const pitch = pitchDeg * Math.PI / 180;

    shipModel.rotation.y = yaw;
    shipModel.rotation.x = pitch;

    // Update display
    document.getElementById('shipYawDisplay').textContent = yawDeg.toFixed(1) + '°';
    document.getElementById('shipPitchDisplay').textContent = pitchDeg.toFixed(1) + '°';
}

// Generate ASCII frames
async function generateFrames() {
    if (!shipModel) {
        alert('Please load a model first!');
        return;
    }

    const numFrames = parseInt(document.getElementById('numFrames').value);
    const startDist = parseFloat(document.getElementById('startDist').value);
    const endDist = parseFloat(document.getElementById('endDist').value);
    const asciiWidth = parseInt(document.getElementById('asciiWidth').value);
    const characters = document.getElementById('asciiChars').value;

    animationFrames = [];
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('downloadBtn').disabled = true;

    // Create temporary ASCII effect for capturing
    const tempRenderer = new THREE.WebGLRenderer();
    tempRenderer.setSize(800, 600);

    const tempEffect = new THREE.AsciiEffect(tempRenderer, characters, {
        invert: true,
        resolution: 0.15
    });
    tempEffect.setSize(800, 600);

    // Add to DOM temporarily
    tempEffect.domElement.style.position = 'absolute';
    tempEffect.domElement.style.left = '-9999px';
    document.body.appendChild(tempEffect.domElement);

    // Store original camera position
    const originalPos = camera.position.clone();
    const originalRot = camera.rotation.clone();

    for (let i = 0; i < numFrames; i++) {
        // Calculate camera distance
        const t = i / (numFrames - 1);
        const distance = startDist + (endDist - startDist) * t;

        // Position camera
        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);

        // Debug ship rotation on first frame
        if (i === 0 && shipModel) {
            console.log('Ship rotation during generation:', {
                yaw: shipModel.rotation.y * 180 / Math.PI,
                pitch: shipModel.rotation.x * 180 / Math.PI
            });
        }

        // Render with ASCII effect
        tempEffect.render(scene, camera);

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

    // Restore camera
    camera.position.copy(originalPos);
    camera.rotation.copy(originalRot);
    controls.update();

    // Cleanup
    document.body.removeChild(tempEffect.domElement);

    updateStatus(`✓ Generated ${animationFrames.length} frames! Click Download JSON.`);
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
    document.getElementById('previewTotal').textContent = animationFrames.length;

    // Start preview animation
    startPreview();
}

// Preview animation
function startPreview() {
    if (previewInterval) {
        clearInterval(previewInterval);
    }

    let currentFrame = 0;
    const preview = document.getElementById('ascii-preview');
    const frameCounter = document.getElementById('previewFrame');

    previewInterval = setInterval(() => {
        if (animationFrames.length === 0) {
            clearInterval(previewInterval);
            return;
        }

        preview.textContent = animationFrames[currentFrame];
        frameCounter.textContent = currentFrame + 1;

        currentFrame = (currentFrame + 1) % animationFrames.length;
    }, 1000 / 15); // 15 FPS
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

document.getElementById('yawSlider').addEventListener('input', (e) => {
    document.getElementById('yawValue').textContent = e.target.value + '°';
    updateShipRotation();
});

document.getElementById('pitchSlider').addEventListener('input', (e) => {
    document.getElementById('pitchValue').textContent = e.target.value + '°';
    updateShipRotation();
});

document.getElementById('generateBtn').addEventListener('click', generateFrames);
document.getElementById('downloadBtn').addEventListener('click', downloadJSON);

// Initialize
init3DViewer();
