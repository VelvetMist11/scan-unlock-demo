// 修改后的 initThreeJS 函数
function initThreeJS(canvasId, modelPath) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // 1. 创建渲染器
  const renderer = new THREE.WebGLRenderer({ 
    canvas,
    alpha: true, // 透明背景
    antialias: true // 抗锯齿
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 性能优化

  // 2. 创建场景和相机
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45, // 视野角度
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // 3. 光照系统（关键修复！）
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // 环境光
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // 方向光
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 4. 加载模型
  const loader = new THREE.GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      // 模型居中处理
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center); // 将模型移动到场景中心

      // 自动调整相机距离
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      camera.position.z = maxDim * 2; // 根据模型大小动态调整
      camera.lookAt(center); // 确保相机对准模型

      scene.add(gltf.scene);
    },
    undefined,
    (error) => {
      console.error(`模型加载失败: ${modelPath}`, error);
      canvas.style.backgroundColor = 'rgba(255,0,0,0.2)'; // 错误提示
    }
  );

  // 5. 渲染循环
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}
