// 模型文件路径（存放在 models 文件夹）
const modelPaths = [
  'models/_models_model1.glb',
  'models/_models_model2.glb',
  'models/_models_model3.glb',
  'models/_models_model4.glb'
];

const scenes = [], cameras = [], renderers = [];

// 初始化每页的 Three.js 场景和渲染器
for (let i = 1; i <= 4; i++) {
  const canvas = document.getElementById('canvas' + i);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 3;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 添加基本光源
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 20, 0);
  scene.add(light);

  // 加载 GLB 模型
  const loader = new THREE.GLTFLoader();
  loader.load(modelPaths[i - 1], function(gltf) {
    scene.add(gltf.scene);
  }, undefined, function(error) {
    console.error(error);
  });

  scenes.push(scene);
  cameras.push(camera);
  renderers.push(renderer);
}

// 渲染循环
function animate() {
  requestAnimationFrame(animate);
  for (let i = 0; i < renderers.length; i++) {
    renderers[i].render(scenes[i], cameras[i]);
  }
}
animate();

// 窗口尺寸变化时更新摄像机和渲染器大小
function onWindowResize() {
  for (let i = 0; i < cameras.length; i++) {
    cameras[i].aspect = window.innerWidth / window.innerHeight;
    cameras[i].updateProjectionMatrix();
    renderers[i].setSize(window.innerWidth, window.innerHeight);
  }
}
window.addEventListener('resize', onWindowResize);

// 触摸滑动翻页逻辑（监听 touchstart/touchend）
let currentPage = 0;
let startX = 0;
const slider = document.getElementById('slider');

slider.addEventListener('touchstart', e => {
  startX = e.changedTouches[0].clientX;
});
slider.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  const threshold = 50; // 滑动阈值（像素）
  if (endX < startX - threshold && currentPage < 3) {
    currentPage++;
  } else if (endX > startX + threshold && currentPage > 0) {
    currentPage--;
  }
  // 切换页面：改变 translateX
  slider.style.transform = `translateX(${-100 * currentPage}vw)`;
  // 更新分页指示器
  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentPage);
  });
});

// 扫码按钮弹窗逻辑
document.querySelectorAll('.scan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('overlay').classList.remove('hidden');
  });
});
document.getElementById('overlay-close').addEventListener('click', () => {
  document.getElementById('overlay').classList.add('hidden');
});
