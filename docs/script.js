function initThreeJS(canvasId, modelPath) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // 渲染器配置
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 场景与相机
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);

  // 光照系统 (必须)
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5,5,5);
  scene.add(directionalLight);

  // 模型加载
  const loader = new THREE.GLTFLoader();
  loader.setCrossOrigin('anonymous'); // 解决 CORS
  loader.load(modelPath, (gltf) => {
    // 模型居中
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);

    // 相机自适应
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 2;
    camera.lookAt(center);

    scene.add(gltf.scene);
  }, undefined, (err) => {
    console.error(`模型加载失败: ${modelPath}`, err);
    canvas.style.backgroundColor = 'rgba(255,0,0,0.2)';
  });

  // 渲染循环
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}
