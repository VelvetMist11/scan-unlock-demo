// —— 模块化加载 Three.js 与 GLTFLoader —— //
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
 
// —— 整页滑动逻辑 —— //
const pages = document.querySelectorAll('.page');
const totalPages = pages.length;
let currentIndex = 0;
const slider = document.getElementById('slider-container');

let startX = 0, deltaX = 0, isDragging = false;

// 阻止浏览器默认滚动
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

document.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isDragging = true;
  slider.style.transition = 'none';
});

document.addEventListener('touchmove', e => {
  if (!isDragging) return;
  deltaX = e.touches[0].clientX - startX;
  slider.style.transform = `translateX(calc(-${currentIndex * 100}vw + ${deltaX}px))`;
});

document.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  slider.style.transition = 'transform 0.3s ease';
  if (deltaX < -50) currentIndex = Math.min(currentIndex + 1, totalPages - 1);
  else if (deltaX > 50) currentIndex = Math.max(currentIndex - 1, 0);
  slider.style.transform = `translateX(-${currentIndex * 100}vw)`;
  updateDots();
  deltaX = 0;
});

function updateDots() {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
}

// —— Three.js 渲染 3D 模型 —— //
const modelPaths = [
  'models/model0.glb',
  'models/model1.glb',
  'models/model2.glb',
  'models/model3.glb'
];

modelPaths.forEach((path, idx) => initThreeJS(`canvas${idx}`, path));

function initThreeJS(canvasId, glbPath) {
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 5;

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5,5,5);
  scene.add(dir);

  // 尺寸自适应
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // 加载 GLB
  new GLTFLoader().load(
    glbPath,
    gltf => {
      const obj = gltf.scene;
      // 居中
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
      scene.add(obj);
    },
    undefined,
    err => console.error('GLB加载失败:', err)
  );

  // 渲染循环
  (function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  })();
}

// —— 扫码解锁 —— //
let html5QrCode = null;
const overlay = document.getElementById('qr-overlay');
const closeBtn = document.getElementById('close-scan');

document.querySelectorAll('.scan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    overlay.style.display = 'flex';
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode('qr-reader');
    }
    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      decoded => {
        console.log('扫码:', decoded);
        html5QrCode.stop()
          .then(() => overlay.style.display = 'none')
          .catch(console.error);
      },
      err => {}
    ).catch(console.error);
  });
});

closeBtn.addEventListener('click', () => {
  if (html5QrCode) html5QrCode.stop().catch(()=>{});
  overlay.style.display = 'none';
});
