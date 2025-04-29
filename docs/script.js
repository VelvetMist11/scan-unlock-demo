const pages = document.querySelectorAll('.page');
const totalPages = pages.length;
let currentIndex = 0;

// 跳转页面
function goToPage(index) {
  const slider = document.getElementById('slider');
  slider.style.transform = `translateX(-${index * 100}vw)`;
  updateDots(index);
}

function updateDots(index) {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// 滑动监听
let startX = 0;
let isMoving = false;

document.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isMoving = true;
});

document.addEventListener('touchend', e => {
  if (!isMoving) return;
  isMoving = false;
  const deltaX = e.changedTouches[0].clientX - startX;

  if (deltaX < -50) {
    currentIndex = Math.min(currentIndex + 1, totalPages - 1);
  } else if (deltaX > 50) {
    currentIndex = Math.max(currentIndex - 1, 0);
  }
  goToPage(currentIndex);
});

// 模型路径数组
const modelPaths = [
  'models/model0.glb',
  'models/model1.glb',
  'models/model2.glb',
  'models/model3.glb'
];

// 初始化每个画布
modelPaths.forEach((path, i) => {
  initThreeJS(`canvas${i}`, path);
});

function initThreeJS(canvasId, modelPath) {
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(3, 5, 5);
  scene.add(light);

  const loader = new THREE.GLTFLoader();
  loader.load(modelPath, gltf => {
    scene.add(gltf.scene);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
}

// 扫码按钮打开
document.querySelectorAll('.scan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('qr-overlay').style.display = 'flex';
  });
});

// 关闭扫码界面
document.getElementById('close-scan').addEventListener('click', () => {
  document.getElementById('qr-overlay').style.display = 'none';
});
