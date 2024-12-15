const imageInput = document.getElementById('imageInput');
const originalCanvas = document.getElementById('originalCanvas');
const pixelCanvas = document.getElementById('pixelCanvas');
const ctx = originalCanvas.getContext('2d');
const pixelCtx = pixelCanvas.getContext('2d');
const frames = [];
const spriteSheetCanvas = document.getElementById('spriteSheet');
const spriteCtx = spriteSheetCanvas.getContext('2d');
const pixelSizeSlider = document.getElementById('pixelSizeSlider');
const pixelSizeInput = document.getElementById('pixelSizeInput');
const decreaseButton = document.getElementById('decreasePixelSize');
const increaseButton = document.getElementById('increasePixelSize');
const loadingIndicator = document.getElementById('loadingIndicator');
const darkModeToggle = document.getElementById('darkModeToggle');
const fpsSlider = document.getElementById('fpsSlider');
const fpsInput = document.getElementById('fpsInput');
const decreaseFps = document.getElementById('decreaseFps');
const increaseFps = document.getElementById('increaseFps');
const animationCanvas = document.getElementById('animationCanvas');
const animCtx = animationCanvas.getContext('2d');
const playAnimationBtn = document.getElementById('playAnimationBtn');




// Load and display image
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 300;
            const scale = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height);

            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            originalCanvas.width = scaledWidth;
            originalCanvas.height = scaledHeight;

            pixelCanvas.width = scaledWidth;
            pixelCanvas.height = scaledHeight;

            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        };
    };
    reader.readAsDataURL(file);
});

function pixelateImage(pixelSize) {
    const offCanvas = new OffscreenCanvas(originalCanvas.width, originalCanvas.height);
    const offCtx = offCanvas.getContext('2d');
    const width = Math.floor(originalCanvas.width / pixelSize);
    const height = Math.floor(originalCanvas.height / pixelSize);

    offCtx.drawImage(originalCanvas, 0, 0, width, height);
    offCtx.imageSmoothingEnabled = false;

    pixelCtx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    pixelCtx.drawImage(offCanvas, 0, 0, width, height, 0, 0, pixelCanvas.width, pixelCanvas.height);
}

function updatePixelSize(value) {
    const pixelSize = Math.max(1, Math.min(50, value));
    pixelSizeSlider.value = pixelSize;
    pixelSizeInput.value = pixelSize;
    pixelateImage(pixelSize);
}

pixelSizeSlider.addEventListener('input', (e) => updatePixelSize(parseInt(e.target.value, 10)));
pixelSizeInput.addEventListener('input', (e) => updatePixelSize(parseInt(e.target.value, 10) || 1));
decreaseButton.addEventListener('click', () => updatePixelSize(parseInt(pixelSizeSlider.value, 10) - 1));
increaseButton.addEventListener('click', () => updatePixelSize(parseInt(pixelSizeSlider.value, 10) + 1));

function updateFps(value) {
    // Clamp to 1–60
    const fpsValue = Math.max(1, Math.min(60, value));
    fpsSlider.value = fpsValue;
    fpsInput.value = fpsValue;
}

// Event listeners for the FPS controls
fpsSlider.addEventListener('input', (e) => updateFps(parseInt(e.target.value, 10)));
fpsInput.addEventListener('input', (e) => updateFps(parseInt(e.target.value, 10) || 1));
decreaseFps.addEventListener('click', () => updateFps(parseInt(fpsSlider.value, 10) - 1));
increaseFps.addEventListener('click', () => updateFps(parseInt(fpsSlider.value, 10) + 1));


const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = pixelCanvas.toDataURL();
    link.click();
});

const clearSpriteSheetBtn = document.getElementById('clearSpriteSheetBtn');
clearSpriteSheetBtn.addEventListener('click', () => {
    spriteCtx.clearRect(0, 0, spriteSheetCanvas.width, spriteSheetCanvas.height);
    // If desired, frames.length = 0;
});


darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

function addFrameToCanvas(pixelSize) {
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = pixelCanvas.width;
    frameCanvas.height = pixelCanvas.height;
    const frameCtx = frameCanvas.getContext('2d');
    updatePixelSize(pixelSize);
    frameCtx.drawImage(pixelCanvas, 0, 0);
    return frameCanvas;
}

document.getElementById('autoAddFramesBtn').addEventListener('click', () => {
    const startValue = parseInt(document.getElementById('startValue').value, 10);
    const endValue = parseInt(document.getElementById('endValue').value, 10);
    const stepValue = parseInt(document.getElementById('stepValue').value, 10);
    const autoReverse = document.getElementById('autoReverseToggle').checked;

    if (isNaN(startValue) || isNaN(endValue) || isNaN(stepValue) || stepValue <= 0) {
        alert("Invalid input. Start, end, and step values must be valid numbers.");
        return;
    }

    const framesToAdd = [];
    for (let size = startValue; size <= endValue; size += stepValue) {
        framesToAdd.push(addFrameToCanvas(size));
    }
    if (autoReverse) {
        for (let size = endValue - stepValue; size >= startValue; size -= stepValue) {
            framesToAdd.push(addFrameToCanvas(size));
        }
    }
    frames.push(...framesToAdd);
    alert(`Frames added! Total frames: ${frames.length}`);
});

document.getElementById('generateSpriteSheetBtn').addEventListener('click', () => {
    const frameWidth = pixelCanvas.width;
    const frameHeight = pixelCanvas.height;
    spriteSheetCanvas.width = frameWidth * frames.length;
    spriteSheetCanvas.height = frameHeight;

    frames.forEach((frame, index) => {
        spriteCtx.drawImage(frame, index * frameWidth, 0);
    });
    alert('Sprite sheet generated!');
});

const saveGifBtn = document.getElementById('saveGifBtn');
saveGifBtn.addEventListener('click', () => {
    if (!frames.length) {
        alert("No frames to save!");
        return;
    }

    const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js',
        width: pixelCanvas.width,
        height: pixelCanvas.height,
    });

    


    const skipFrames = parseInt(document.getElementById('skipFrames').value, 10) || 1;
    frames.forEach((frame, index) => {
        if (index % skipFrames === 0) {
            gif.addFrame(frame, { delay: 1000 / parseInt(document.getElementById('fpsSlider').value, 10) });
        }
    });

    loadingIndicator.style.display = 'block';
    gif.on('progress', (progress) => {
        console.log(`GIF progress: ${Math.round(progress * 100)}%`);
    });

    gif.on('finished', (blob) => {
        loadingIndicator.style.display = 'none';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'animation.gif';
        link.click();
    });

    gif.render();
});

// Animation functionality
//const animationCanvas = document.getElementById('animationCanvas');
//const animCtx = animationCanvas.getContext('2d');
//const fpsSlider = document.getElementById('fpsSlider');
//const playAnimationBtn = document.getElementById('playAnimationBtn');
//const fpsInput = document.getElementById('fpsInput');
//const decreaseFps = document.getElementById('decreaseFps');
//const increaseFps = document.getElementById('increaseFps');


let animationRunning = false;

playAnimationBtn.addEventListener('click', () => {
    animationRunning = !animationRunning;
    playAnimationBtn.textContent = animationRunning ? 'Stop Animation' : 'Play Animation';

    if (animationRunning) {
        playAnimation();
    }
});

function playAnimation() {
    if (!frames.length) {
        alert("No frames to animate!");
        animationRunning = false;
        playAnimationBtn.textContent = 'Play Animation';
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

    requestAnimationFrame(animate);
}
