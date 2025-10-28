# ASCII Ship Animations

Browser-based 3D ship model to ASCII animation generator.

Adapted from https://github.com/AndrewSink/STL-to-ASCII-Generator/

## Quick Start

1. Start the local server:
```bash
python serve.py
```

2. Open the generator:
```
http://localhost:8000/web/generator.html
```

3. Load a ship model (.glb, .gltf, or .stl format)

4. Adjust parameters and generate animation frames

5. Download the JSON file and save to `output/ascii_frames/`

6. View the animation:
```
http://localhost:8000/web/index.html
```

## Project Structure

- `web/generator.html` - Interactive 3D viewer and frame generator
- `web/generator.js` - Three.js ASCII animation generator
- `web/index.html` - Landing page animation player
- `web/ascii_player.js` - Animation playback engine
- `3d_models/` - Ship 3D models (victoria.glb, pinnace.obj, frigate.obj)
- `output/ascii_frames/` - Generated animation JSON files
- `serve.py` - Simple HTTP server

## Features

- Interactive 3D model viewer with OrbitControls
- Real-time camera position display (distance, azimuth, elevation)
- Ship rotation controls (yaw/pitch)
- Adjustable animation parameters (frames, distances, ASCII characters)
- Live ASCII animation preview
- JSON export for web playback
