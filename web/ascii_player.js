class AsciiPlayer {
    constructor() {
        this.currentShip = 'pinnace';
        this.animations = {};
        this.currentFrame = 0;
        this.isPlaying = true;
        this.fps = 15;
        this.intervalId = null;

        this.initElements();
        this.initEventListeners();
        this.loadAnimation(this.currentShip);
    }

    initElements() {
        this.asciiDisplay = document.getElementById('ascii-display');
        this.shipSelect = document.getElementById('ship-select');
        this.fpsSlider = document.getElementById('fps-slider');
        this.fpsValue = document.getElementById('fps-value');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.frameCounter = document.getElementById('frame-counter');
        this.totalFrames = document.getElementById('total-frames');
        this.status = document.getElementById('status');
    }

    initEventListeners() {
        this.shipSelect.addEventListener('change', (e) => {
            this.switchShip(e.target.value);
        });

        this.fpsSlider.addEventListener('input', (e) => {
            this.fps = parseInt(e.target.value);
            this.fpsValue.textContent = this.fps;
            if (this.isPlaying) {
                this.stop();
                this.play();
            }
        });

        this.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        this.restartBtn.addEventListener('click', () => {
            this.restart();
        });
    }

    async loadAnimation(shipName) {
        this.status.textContent = `Loading ${shipName}...`;

        try {
            const response = await fetch(`../output/ascii_frames/${shipName}_animation.json`);

            if (!response.ok) {
                throw new Error(`Failed to load animation: ${response.statusText}`);
            }

            const data = await response.json();
            this.animations[shipName] = data;

            this.currentFrame = 0;
            this.totalFrames.textContent = data.num_frames;

            this.status.textContent = `Loaded ${shipName}`;

            if (this.isPlaying) {
                this.play();
            } else {
                this.displayFrame();
            }
        } catch (error) {
            console.error('Error loading animation:', error);
            this.asciiDisplay.textContent = `Error loading animation for ${shipName}.\n\nPlease run: python main.py --ship ${shipName}\n\nOr generate all ships: python main.py`;
            this.status.textContent = 'Error loading animation';
        }
    }

    displayFrame() {
        const animation = this.animations[this.currentShip];
        if (!animation || !animation.frames) {
            return;
        }

        this.asciiDisplay.textContent = animation.frames[this.currentFrame];
        this.frameCounter.textContent = this.currentFrame + 1;
    }

    play() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        const frameDelay = 1000 / this.fps;

        this.intervalId = setInterval(() => {
            this.displayFrame();
            this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentShip].num_frames;
        }, frameDelay);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.playPauseBtn.textContent = 'Pause';
            this.play();
        } else {
            this.playPauseBtn.textContent = 'Play';
            this.stop();
        }
    }

    restart() {
        this.currentFrame = 0;
        this.displayFrame();
    }

    switchShip(shipName) {
        this.stop();
        this.currentShip = shipName;

        if (this.animations[shipName]) {
            this.currentFrame = 0;
            this.totalFrames.textContent = this.animations[shipName].num_frames;
            this.status.textContent = `Loaded ${shipName}`;

            if (this.isPlaying) {
                this.play();
            } else {
                this.displayFrame();
            }
        } else {
            this.loadAnimation(shipName);
        }
    }
}

// Initialize player when page loads
window.addEventListener('DOMContentLoaded', () => {
    const player = new AsciiPlayer();
});
