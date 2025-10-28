# ASCII Ship Animations

Browser-based 3D ship model to ASCII animation generator for Admiral Labs landing page.

## Live Demo

- **Landing Page**: https://aymeric-roucher.github.io/AsciiAnimations/
- **Generator Tool**: https://aymeric-roucher.github.io/AsciiAnimations/web/generator.html

## Quick Start

### Generate ASCII Animations

1. Start the local server:
```bash
python serve.py
```

2. Open the generator:
```
http://localhost:8000/web/generator.html
```

3. Load a ship model (.glb, .gltf, or .stl format)

4. Adjust parameters:
   - **Camera position**: Use mouse to orbit and position camera
   - **Zoom**: Use slider or mouse wheel for precise zoom control
   - **Frames**: Number of animation frames (default: 120)
   - **Travel Distance**: How far the ship moves through the scene
   - **Animation Style**: "Stop in middle" (smooth deceleration) or "Pass through" (linear)
   - **ASCII Width**: Resolution/detail level (default: 200)

5. Click "Generate Frames" - automatically saves to `animation.json`

6. View the animation on the landing page:
```
http://localhost:8000/
```

## Project Structure

```
├── index.html              # Landing page (Admiral Labs)
├── animation.json          # Generated animation frames
├── serve.py               # Simple HTTP server
├── 3d_models/             # Ship 3D models
│   ├── nao_victoria_galleon_ship.glb
│   ├── pinnace.obj
│   └── frigate.obj
└── web/
    ├── generator.html     # Interactive 3D viewer & frame generator
    ├── generator.js       # Three.js ASCII generation logic
    ├── ascii_player.js    # Animation playback engine (legacy)
    └── styles.css         # Styling
```

## Features

### Generator Tool
- Interactive 3D model viewer with OrbitControls
- Real-time camera position display (distance, azimuth, elevation)
- Precise zoom control with slider
- Two animation modes:
  - **Stop in middle**: Ship smoothly decelerates to stop at center (cosine easing)
  - **Pass through**: Ship moves linearly from behind to ahead
- Adjustable ASCII resolution and character ramp
- Live ASCII animation preview
- Automatic JSON export on generation

### Landing Page
- Full-screen ASCII ship animation background
- Responsive military-style design
- Industry header with hover effects
- Centered hero section
- Professional typography (ui-sans-serif, ui-monospace)

## Technical Details

### ASCII Generation
- **Engine**: Three.js with AsciiEffect
- **Rendering**: WebGL-based 3D rendering converted to ASCII
- **Character Ramp**: ` .:-+*=%@#` (10 characters, light to dark)
- **Cell Aggregation**: Weighted luminance averaging (0.299×R + 0.587×G + 0.114×B)
- **Animation**: Ship moves along its forward direction, camera stays fixed

### Camera System
- Camera position captured from OrbitControls
- Animation preserves exact viewing angle
- Only ship position changes during frame generation
- Zoom syncs bidirectionally (slider ↔ mouse wheel)

## Animation Workflow

1. **Position camera** using mouse controls in 3D viewer
2. **Adjust zoom** for desired framing
3. **Set ship rotation** (optional, via yaw/pitch sliders)
4. **Configure animation**:
   - Number of frames for smoothness
   - Travel distance for ship movement
   - Animation style (stop/pass-through)
5. **Generate** - frames automatically saved to `animation.json`
6. **Deploy** - push to GitHub Pages for live site

## Deployment

The landing page is deployed via GitHub Pages:

```bash
git add .
git commit -m "Update ASCII animation"
git push origin main
```

Site updates automatically at: https://aymeric-roucher.github.io/AsciiAnimations/

## Models

- **Victoria** (GLB): Nao Victoria galleon ship - primary model
- **Pinnace** (OBJ): Historic sailing vessel
- **Frigate** (OBJ): Naval warship

All models are centered and scaled automatically on load.

## Browser Requirements

- Modern browser with WebGL support
- Three.js r128
- OrbitControls
- GLTFLoader, STLLoader
- AsciiEffect

## Credits

ASCII generation adapted from [STL-to-ASCII-Generator](https://github.com/AndrewSink/STL-to-ASCII-Generator/)
