// 1. 翻页控制
const slider = document.getElementById('slider-container');
const pages  = document.querySelectorAll('.page');
let currentIndex = 0;
let startX = 0, deltaX = 0, dragging = false;

function goToPage(idx) {
  currentIndex = Math.max(0, Math.min(idx, pages.length - 1));
  slider.style.transform = `translateX(-${currentIndex * 100}vw)`;
  document.querySelectorAll('.dot').forEach((d,i) =>
    d.classList.toggle('active', i === currentIndex)
  );
}

// 2. 触摸事件
slider.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  dragging = true;
  slider.style.transition = 'none';
});
slider.addEventListener('touchmove', e => {
  if (!dragging) return;
  deltaX = e.touches[0].clientX - startX;
  slider.style.transform = `translateX(calc(-${currentIndex * 100}vw + ${deltaX}px))`;
  e.preventDefault();  // 禁止系统滚动
}, { passive:false });
slider.addEventListener('touchend', e => {
  dragging = false;
  slider.style.transition = 'transform 0.3s ease';
  if (deltaX < -50)  goToPage(currentIndex + 1);
  else if (deltaX > 50) goToPage(currentIndex - 1);
  else goToPage(currentIndex);
  deltaX = 0;
});

// 3. Three.js 简易初始化
function initThreeJS(canvasId, modelPath) {
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45,
      window.innerWidth/window.innerHeight, 0.1, 100
  );
  camera.position.z = 5;
  new THREE.DirectionalLight(0xffffff,1).position.set(1,1,1).addTo(scene);

  new THREE.GLTFLoader().load(modelPath, gltf => {
    scene.add(gltf.scene);
    animate();
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
}

// 4. 扫码弹窗
document.querySelectorAll('.scan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('qr-overlay').style.display = 'flex';
  });
});
document.getElementById('close-scan')
  .addEventListener('click', () => {
    document.getElementById('qr-overlay').style.display = 'none';
  });

// 5. 启动：加载模型、初始页
['canvas0','canvas1','canvas2','canvas3']
  .forEach((id,i) => initThreeJS(id, `models/model${i}.glb`));
goToPage(0);
