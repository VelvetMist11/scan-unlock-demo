let currentIndex = 0;
const totalPages = 4;
let startX = 0;
let currentX = 0;
let deltaX = 0;
let isDragging = false;
const slider = document.getElementById('slider');

// 增强版滑动逻辑
document.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isDragging = true;
  slider.style.transition = 'none';
});

document.addEventListener('touchmove', e => {
  if (!isDragging) return;
  
  currentX = e.touches[0].clientX;
  deltaX = currentX - startX;
  
  // 实时拖动效果 + 边界限制
  const maxDrag = window.innerWidth * 0.3;
  const limitedDelta = Math.max(-maxDrag, Math.min(deltaX, maxDrag));
  
  slider.style.transform = `translateX(calc(-${currentIndex * 100}vw + ${limitedDelta}px)`;
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  
  // 智能阈值判断（基于屏幕比例）
  const threshold = window.innerWidth * 0.15;
  let newIndex = currentIndex;
  
  if (Math.abs(deltaX) > threshold) {
    newIndex += deltaX > 0 ? -1 : 1;
    newIndex = Math.max(0, Math.min(newIndex, totalPages - 1));
  }

  // 强制重置状态
  deltaX = 0;
  currentIndex = newIndex;
  slider.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  goToPage(currentIndex);
});

function goToPage(index) {
  currentIndex = index;
  slider.style.transform = `translateX(-${index * 100}vw)`;
  updateDots(index);
  
  // 调试输出
  console.log(`已切换到第 ${index + 1} 页`);
}

function updateDots(index) {
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// 模型初始化（优化版）
const initThreeJS = (canvasId, modelPath) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ 
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  
  // 自动适配屏幕
  const resizeHandler = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener('resize', resizeHandler);
  resizeHandler();

  // 加载模型
  new THREE.GLTFLoader().load(modelPath, gltf => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    
    // 自动居中模型
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
    camera.position.z = box.getSize(new THREE.Vector3()).length() * 1.5;
    
    scene.add(gltf.scene);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  }, undefined, err => {
    console.error(`模型加载失败: ${modelPath}`, err);
    canvas.style.backgroundColor = '#f00'; // 错误提示
  });
};

// 初始化所有模型
['canvas0', 'canvas1', 'canvas2', 'canvas3'].forEach((id, index) => {
  initThreeJS(id, `models/model${index}.glb`);
});

// 微信浏览器特殊处理
if (/MicroMessenger/i.test(navigator.userAgent)) {
  document.body.classList.add('wechat-browser');
  console.log('微信环境优化已启用');
}
