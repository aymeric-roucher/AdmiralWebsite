# Admiral Labs Website

This has
- The website for Admiral Labs
- A Browser-based 3D ship model to ASCII animation generator for landing page.

## Live Demo

- **Landing Page**: https://aymeric-roucher.github.io/AdmiralWebsite/
- **Generator Tool**: https://aymeric-roucher.github.io/AdmiralWebsite/web/generator.html


## ASCII animation

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


### ASCII Generation
- **Engine**: Three.js with AsciiEffect
- **Rendering**: WebGL-based 3D rendering converted to ASCII
- **Character Ramp**: ` .:-+*=%@#` (10 characters, light to dark)
- **Cell Aggregation**: Weighted luminance averaging (0.299×R + 0.587×G + 0.114×B)
- **Animation**: Ship moves along its forward direction, camera stays fixed

### Animation Workflow for 3D

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

Site updates automatically at: https://aymeric-roucher.github.io/AdmiralWebsite/

## Browser Requirements

- Modern browser with WebGL support
- Three.js r128
- OrbitControls
- GLTFLoader, STLLoader
- AsciiEffect

## Credits

ASCII generation adapted from [STL-to-ASCII-Generator](https://github.com/AndrewSink/STL-to-ASCII-Generator/)

Sources: 
- 3D Model from [Sketchfab](https://sketchfab.com/3d-models/russian-chebeque-minerva-634837dd7f314aefa848e4c16fa5304d)
- Edited [here](https://threejs.org/editor/)