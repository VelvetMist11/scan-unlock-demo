const totalPages = 4;
let currentPage = 0;

// 模型路径数组（你已上传至 docs/models/）
const modelFiles = [
  'models/model1.glb',
  'models/model2.glb',
  'models/model3.glb',
  'models/model4.glb'
];

// 初始化模型
function loadModel(canvasId, modelPath) {
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 2).normalize();
  scene.add(light);

  const loader = new THREE.GLTFLoader();
  loader.load(modelPath, gltf => {
    const model = gltf.scene;
    model.scale.set(1.5, 1.5, 1.5);
    scene.add(model);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
}

// 初始化所有模型
for (let i = 0; i < totalPages; i++) {
  loadModel(`canvas${i}`, modelFiles[i]);
}

// 页面切换
function goToPage(index) {
  currentPage = index;
  const container = document.getElementById('container');
  container.style.transform = `translateX(-${100 * index}vw)`;

  // 更新分页圆点
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// 绑定圆点跳转事件
document.querySelectorAll('.dot').forEach((dot, index) => {
  dot.addEventListener('click', () => goToPage(index));
});

// 绑定扫码按钮
document.querySelectorAll('.scan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('qr-overlay').style.display = 'flex';
    startQRCodeScanner(); // 自定义扫码函数（如果你接入扫码功能）
  });
});

// 关闭扫码层
document.getElementById('close-scan').addEventListener('click', () => {
  document.getElementById('qr-overlay').style.display = 'none';
});

// 左右滑动手势（跳转，不是平滑滑动）
let startX = 0;
document.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

document.addEventListener('touchend', e => {
  const deltaX = e.changedTouches[0].clientX - startX;
  if (Math.abs(deltaX) > 50) {
    if (deltaX < 0 && currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    } else if (deltaX > 0 && currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }
});

// 默认打开第 0 页
goToPage(0);
