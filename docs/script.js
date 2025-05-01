// 分页设置
const pages = document.querySelectorAll('.page');
const totalPages = pages.length;
let currentIndex = 0;

function goToPage(index) {
  const slider = document.getElementById('slider-container');
  slider.style.transform = `translateX(-${index * 100}vw)`;
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// 触摸滑动监听
let startX = 0;
let isMoving = false;
document.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isMoving = true; });
document.addEventListener('touchend', e => {
  if (!isMoving) return;
  isMoving = false;
  const deltaX = e.changedTouches[0].clientX - startX;
  if (deltaX < -50) currentIndex = Math.min(currentIndex + 1, totalPages - 1);
  else if (deltaX > 50) currentIndex = Math.max(currentIndex - 1, 0);
  goToPage(currentIndex);
});

// 初始化三维场景
function initThreeJS(canvas, modelPath) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

  // 光源
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(3, 5, 5);
  scene.add(dirLight);

  // 自适应画布大小
  const resize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  // 加载模型并居中
  new THREE.GLTFLoader().load(modelPath, gltf => {
    const model = gltf.scene;
    scene.add(model);

    // 计算包围盒与中心
    const box    = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    // 平移到世界原点
    model.position.sub(center);

    // 动态调节相机距离
    const size = box.getSize(new THREE.Vector3()).length();
    camera.position.set(0, 0, size * 1.2);
    camera.lookAt(0, 0, 0);

    // 渲染循环
    (function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    })();
  }, undefined, err => console.error(`加载失败: ${modelPath}`, err));
}

// 批量初始化模型
document.querySelectorAll('.model-canvas').forEach((canvas, i) => {
  initThreeJS(canvas, `models/model${i}.glb`);
});

// 扫码按钮功能
document.querySelectorAll('.scan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('qr-overlay').style.display = 'flex';
  });
});
document.getElementById('close-scan').addEventListener('click', () => {
  document.getElementById('qr-overlay').style.display = 'none';
});
