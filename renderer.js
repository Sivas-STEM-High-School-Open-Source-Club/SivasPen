const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const penWidthSlider = document.getElementById('penWidth');
const eraserWidthSlider = document.getElementById('eraserWidth');
const penBtn = document.getElementById('pen');
const eraserBtn = document.getElementById('eraser');
const clearBtn = document.getElementById('clear');
const hideBtn = document.getElementById('hide');
const exitBtn = document.getElementById('exit');
const closeAppBtn = document.getElementById('closeApp');
const eraserPreview = document.getElementById('eraserPreview');
const toolbar = document.getElementById('toolbar');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const blankBtn = document.getElementById('blank');
const reactivateLogo = document.getElementById('reactivateLogo');

let currentTool = 'pen';
let penWidth = penWidthSlider.value;
let eraserWidth = eraserWidthSlider.value;
let currentColor = colorPicker.value;
let painting = false;
let undoStack = [];
let redoStack = [];
let isBlankMode = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(canvas.toDataURL());
    const img = new Image();
    img.src = undoStack.pop();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(canvas.toDataURL());
    const img = new Image();
    img.src = redoStack.pop();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }
}

function startPosition(e) {
  painting = true;
  saveState();
  draw(e);
}

function endPosition() {
  painting = false;
  ctx.beginPath();
}

function draw(e) {
  const x = e.clientX;
  const y = e.clientY;
  if (!painting) return;

  if (currentTool === 'pen') {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  } else if (currentTool === 'eraser') {
    if (isBlankMode) {
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(x - eraserWidth / 2, y - eraserWidth / 2, eraserWidth, eraserWidth);
    } else {
      ctx.clearRect(x - eraserWidth / 2, y - eraserWidth / 2, eraserWidth, eraserWidth);
    }
  }
}

colorPicker.addEventListener('input', e => currentColor = e.target.value);
penWidthSlider.addEventListener('input', e => penWidth = e.target.value);
eraserWidthSlider.addEventListener('input', e => eraserWidth = e.target.value);

penBtn.addEventListener('click', () => {
  currentTool = 'pen';
  penBtn.classList.add('selected');
  eraserBtn.classList.remove('selected');
  eraserPreview.style.display = 'none';
});

eraserBtn.addEventListener('click', () => {
  currentTool = 'eraser';
  eraserBtn.classList.add('selected');
  penBtn.classList.remove('selected');
  eraserPreview.style.display = 'block';
});

clearBtn.addEventListener('click', () => {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

blankBtn.addEventListener('click', () => {
  saveState();
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  isBlankMode = true;
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

hideBtn.addEventListener('click', () => {
  canvas.style.display = 'none';
  toolbar.style.display = 'none';
  eraserPreview.style.display = 'none';
  reactivateLogo.style.display = 'block';
});

reactivateLogo.addEventListener('click', () => {
  canvas.style.display = 'block';
  toolbar.style.display = 'block';
  if (currentTool === 'eraser') eraserPreview.style.display = 'block';
  reactivateLogo.style.display = 'none';
});

exitBtn.addEventListener('click', () => {
  canvas.style.display = 'none';
  eraserPreview.style.display = 'none';
});

closeAppBtn.addEventListener('click', () => {
  window.electronAPI.quit();
});

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', e => {
  if (currentTool === 'eraser') {
    eraserPreview.style.width = `${eraserWidth}px`;
    eraserPreview.style.height = `${eraserWidth}px`;
    eraserPreview.style.left = `${e.clientX - eraserWidth / 2}px`;
    eraserPreview.style.top = `${e.clientY - eraserWidth / 2}px`;
  }
  draw(e);
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  startPosition(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  draw(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchend', endPosition);

let isDragging = false;
let offsetX, offsetY;

toolbar.addEventListener("mousedown", e => {
  if (["INPUT", "BUTTON", "LABEL"].includes(e.target.tagName)) return;
  isDragging = true;
  offsetX = e.clientX - toolbar.offsetLeft;
  offsetY = e.clientY - toolbar.offsetTop;
});

document.addEventListener("mousemove", e => {
  if (isDragging) {
    toolbar.style.left = `${e.clientX - offsetX}px`;
    toolbar.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});
