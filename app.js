const imageInput = document.getElementById('imageInput');
const originalCanvas = document.getElementById('originalCanvas');
const pixelCanvas = document.getElementById('pixelCanvas');
const ctx = originalCanvas.getContext('2d');
const pixelCtx = pixelCanvas.getContext('2d');
const frames = [];
const spriteSheetCanvas = document.getElementById('spriteSheet');
const spriteCtx = spriteSheetCanvas.getContext('2d');

// Load and display image
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            window.addEventListener('resize', () => {
                const canvases = document.querySelectorAll('canvas');
                canvases.forEach(canvas => {
                    // Force the canvas to maintain its CSS-defined dimensions
                    canvas.style.width = `${canvas.width}px`;
                    canvas.style.height = `${canvas.height}px`;
                });
            });
            
            
            const MAX_WIDTH = 400; // Max width of the display box
            const MAX_HEIGHT = 300; // Max height of the display box
        
            // Calculate scaling ratio to fit image within 400x300
            const widthRatio = MAX_WIDTH / img.width;
            const heightRatio = MAX_HEIGHT / img.height;
            const scale = Math.min(widthRatio, heightRatio); // Preserve aspect ratio
        
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
        
            // Set canvas dimensions to scaled image size
            originalCanvas.width = scaledWidth;
            originalCanvas.height = scaledHeight;
        
            pixelCanvas.width = scaledWidth;
            pixelCanvas.height = scaledHeight;
        
            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        };
    };
    reader.readAsDataURL(file);
});

// Pixelate image
function pixelateImage(pixelSize) {
    const width = originalCanvas.width / pixelSize;
    const height = originalCanvas.height / pixelSize;

    // Draw small version
    pixelCtx.drawImage(originalCanvas, 0, 0, width, height);

    // Scale it back up
    pixelCtx.imageSmoothingEnabled = false;
    pixelCtx.drawImage(pixelCanvas, 0, 0, width, height, 0, 0, pixelCanvas.width, pixelCanvas.height);
}

document.getElementById('pixelSizeSlider').addEventListener('input', (e) => {
    const pixelSize = parseInt(e.target.value, 10);
    pixelateImage(pixelSize);
});

// Download pixel art
const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = pixelCanvas.toDataURL();
    link.click();
});

// Add frame to sprite sheet
document.getElementById('addFrameBtn').addEventListener('click', () => {
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = pixelCanvas.width;
    frameCanvas.height = pixelCanvas.height;
    const frameCtx = frameCanvas.getContext('2d');
    frameCtx.drawImage(pixelCanvas, 0, 0);
    frames.push(frameCanvas);
    alert(`Frame added! Total frames: ${frames.length}`);
});

// Generate sprite sheet
document.getElementById('generateSpriteSheetBtn').addEventListener('click', () => {
    const frameWidth = pixelCanvas.width;
    const frameHeight = pixelCanvas.height;

    // Resize the sprite sheet canvas
    spriteSheetCanvas.width = frameWidth * frames.length;
    spriteSheetCanvas.height = frameHeight;

    // Draw each frame side by side
    frames.forEach((frame, index) => {
        spriteCtx.drawImage(frame, index * frameWidth, 0);
    });

    alert('Sprite sheet generated!');
});

// Add the following code for animation preview
const animationCanvas = document.getElementById('animationCanvas');
const animCtx = animationCanvas.getContext('2d');
const fpsSlider = document.getElementById('fpsSlider');
const playAnimationBtn = document.getElementById('playAnimationBtn');

let animationRunning = false;

playAnimationBtn.addEventListener('click', () => {
    animationRunning = !animationRunning;
    if (animationRunning) {
        playAnimation();
    }
});

function playAnimation() {
    if (!frames.length) {
        alert("No frames to animate!");
        return;
    }

    animationCanvas.width = pixelCanvas.width;
    animationCanvas.height = pixelCanvas.height;

    let currentFrame = 0;
    const fps = parseInt(fpsSlider.value, 10);
    const interval = 1000 / fps;

    let lastTime = 0;

    function animate(timestamp) {
        if (!animationRunning) return;
        if (timestamp - lastTime >= interval) {
            animCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
            animCtx.drawImage(frames[currentFrame], 0, 0);
            currentFrame = (currentFrame + 1) % frames.length;
            lastTime = timestamp;
        }
        requestAnimationFrame(animate);
    }

    animationRunning = true;
    requestAnimationFrame(animate);
}


// Handle window resize for responsive canvas
window.addEventListener('resize', () => {
    const canvasElements = [originalCanvas, pixelCanvas, spriteSheetCanvas, animationCanvas];
    canvasElements.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Scale the canvas to fit its parent container
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        // Restore the original pixel data
        ctx.putImageData(imageData, 0, 0);
    });
});
