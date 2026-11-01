const videoElement = document.getElementById('video');
const drawCanvas = document.getElementById('drawCanvas');
const drawCtx = drawCanvas.getContext('2d');
const toggleDrawBtn = document.getElementById('toggleDraw');
const clearCanvasBtn = document.getElementById('clearCanvas');
const brushSizeInput = document.getElementById('brushSize');
const colorButtons = document.querySelectorAll('.color-btn');

const state = {
  color: '#ff4d4d',
  brushSize: Number(brushSizeInput.value),
  drawingEnabled: false,
  lastX: null,
  lastY: null,
};

function resizeCanvas() {
  const displayWidth = drawCanvas.clientWidth;
  const displayHeight = drawCanvas.clientHeight;

  if (drawCanvas.width !== displayWidth || drawCanvas.height !== displayHeight) {
    drawCanvas.width = displayWidth;
    drawCanvas.height = displayHeight;
  }
}

function clearCanvas() {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  state.lastX = null;
  state.lastY = null;
}

function drawFromLandmark(x, y) {
  const targetX = x * drawCanvas.width;
  const targetY = y * drawCanvas.height;

  if (state.lastX === null || state.lastY === null) {
    state.lastX = targetX;
    state.lastY = targetY;
    return;
  }

  drawCtx.beginPath();
  drawCtx.moveTo(state.lastX, state.lastY);
  drawCtx.lineTo(targetX, targetY);
  drawCtx.strokeStyle = state.color;
  drawCtx.lineWidth = state.brushSize;
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
  drawCtx.stroke();

  state.lastX = targetX;
  state.lastY = targetY;
}

function setActiveColor(button) {
  colorButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
  state.color = button.dataset.color;
}

async function startCamera() {
  const constraints = { video: { facingMode: 'user' } };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  videoElement.srcObject = stream;
  await videoElement.play();

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  hands.onResults((results) => {
    if (!results.multiHandLandmarks || !results.multiHandLandmarks.length) {
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const indexTip = landmarks[8];

    if (state.drawingEnabled) {
      drawFromLandmark(indexTip.x, indexTip.y);
    } else {
      state.lastX = null;
      state.lastY = null;
    }
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
  });

  camera.start();
}

colorButtons.forEach((btn) => {
  btn.addEventListener('click', () => setActiveColor(btn));
});

brushSizeInput.addEventListener('input', (event) => {
  state.brushSize = Number(event.target.value);
});

clearCanvasBtn.addEventListener('click', clearCanvas);

toggleDrawBtn.addEventListener('click', () => {
  state.drawingEnabled = !state.drawingEnabled;
  toggleDrawBtn.textContent = state.drawingEnabled ? 'Stop Drawing' : 'Start Drawing';
  if (!state.drawingEnabled) {
    state.lastX = null;
    state.lastY = null;
  }
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
startCamera().catch((error) => {
  console.error('Camera initialization failed:', error);
  alert('Camera access is required for AirCanvas. Please allow webcam permission and refresh the page.');
});
