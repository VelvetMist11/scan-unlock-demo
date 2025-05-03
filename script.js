// —— 增强滑动翻页（整屏跳转） —— //
const pages = document.querySelectorAll('.page');
const totalPages = pages.length;
let currentIndex = 0;
const slider = document.getElementById('slider-container');

let startX = 0, deltaX = 0, isDragging = false;

// 禁止整体页面滚动
document.addEventListener('touchmove', e => {
  e.preventDefault();
}, { passive: false });

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

document.addEventListener('touchend', e => {
  if (!isDragging) return;
  isDragging = false;
  slider.style.transition = 'transform 0.3s ease';

  if (deltaX < -50) {
    currentIndex = Math.min(currentIndex + 1, totalPages - 1);
  } else if (deltaX > 50) {
    currentIndex = Math.max(currentIndex - 1, 0);
  }
  slider.style.transform = `translateX(-${currentIndex * 100}vw)`;
  updateDots(currentIndex);
  deltaX = 0;
});

// 更新分页小点
function updateDots(index) {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// —— Three.js 模型加载 —— //
const modelPaths = [
  'models/model0.glb',
  'models/model1.glb',
  'models/model2.glb',
  'models/model3.glb'
];

modelPaths.forEach((path, i) => {
  initThreeJS(`canvas${i}`, path);
});

function initThreeJS(canvasId, modelPath) {
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 5, 5);
  scene.add(dir);

  // 适配尺寸
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // 加载 GLB
  new THREE.GLTFLoader().load(
    modelPath,
    gltf => {
      // 自动居中
      const obj = gltf.scene;
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
      scene.add(obj);
    },
    undefined,
    err => console.error('模型加载失败：', modelPath, err)
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

document.querySelectorAll('.scan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    overlay.style.display = 'flex';
    // 初始化扫码器（只做一次）
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode('qr-reader');
    }
    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        console.log('扫码结果：', decodedText);
        // 如果需要校验 decodedText，可在此判断
        html5QrCode.stop().then(() => {
          overlay.style.display = 'none';
        });
      },
      (err) => {
        // 扫码失败回调，可忽略
      }
    ).catch(err => console.error('启动扫码失败', err));
  });
});

// 关闭按钮
document.getElementById('close-scan').addEventListener('click', () => {
  if (html5QrCode) {
    html5QrCode.stop().catch(console.warn);
  }
  overlay.style.display = 'none';
});
