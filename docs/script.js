// 初始化Three.js场景
function initScene(canvasId, modelPath) {
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 3;

  const loader = new THREE.GLTFLoader();
  loader.load(modelPath, (gltf) => {
    scene.add(gltf.scene);
  }, undefined, (error) => {
    console.error('模型加载失败', error);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

// 批量初始化
['model1.glb', 'model2.glb', 'model3.glb', 'model4.glb'].forEach((model, index) => {
  initScene(`modelCanvas${index}`, `docs/models/${model}`);
});

// 分页指示器逻辑（可补充左右滑动逻辑）

// 扫码按钮逻辑
const scanButton = document.getElementById('scanButton');
const scannerOverlay = document.getElementById('scanner-overlay');
const backButton = document.getElementById('backButton');

scanButton.onclick = () => {
  scannerOverlay.style.display = 'flex';
  const html5QrCode = new Html5Qrcode("qr-reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (decodedText, decodedResult) => {
      console.log(`扫码成功: ${decodedText}`);
      html5QrCode.stop();
      scannerOverlay.style.display = 'none';
      // 根据扫码内容解锁某一页
    },
    (errorMessage) => {
      // 忽略连续失败
    }
  );
};

backButton.onclick = () => {
  scannerOverlay.style.display = 'none';
};
