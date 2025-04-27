let unlocked = [true, false, false, false];
let currentSlide = 0;

const slider = document.getElementById('slider');
const scannerOverlay = document.getElementById('scanner-overlay');
const html5QrCode = new Html5Qrcode("qr-reader");

// 初始化加载四个模型
const modelPaths = [
  'models/model1.glb',
  'models/model2.glb',
  'models/model3.glb',
  'models/model4.glb'
];

const mixers = [];

function loadModel(canvasId, modelPath) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({canvas: document.getElementById(canvasId), alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);

  const loader = new THREE.GLTFLoader();
  loader.load(modelPath, gltf => {
    scene.add(gltf.scene);
    camera.position.z = 3;

    const mixer = new THREE.AnimationMixer(gltf.scene);
    if (gltf.animations.length > 0) {
      mixer.clipAction(gltf.animations[0]).play();
    }
    mixers.push(mixer);

    function animate() {
      requestAnimationFrame(animate);
      mixers.forEach(m => m.update(0.01));
      renderer.render(scene, camera);
    }
    animate();
  });
}

// 加载所有模型
modelPaths.forEach((path, idx) => loadModel(`modelCanvas${idx}`, path));

// 扫码逻辑
function openScanner() {
  scannerOverlay.style.display = "flex";
  document.body.style.overflow = "hidden"; // 禁止滑动

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      console.log("扫码成功: ", decodedText);

      if (decodedText === "unlock2") unlocked[1] = true;
      if (decodedText === "unlock3") unlocked[2] = true;
      if (unlocked[1] && unlocked[2]) unlocked[3] = true; // 第四个自动解锁

      updateLocks();
      closeScanner();
    },
    (errorMessage) => {}
  ).catch(err => console.error(err));
}

function closeScanner() {
  scannerOverlay.style.display = "none";
  document.body.style.overflow = ""; // 恢复滑动
  html5QrCode.stop();
}

function updateLocks() {
  unlocked.forEach((state, idx) => {
    const overlay = document.getElementById(`lockOverlay${idx}`);
    if (overlay && state) overlay.style.display = "none";
  });
}

// 滑动逻辑
let startX = 0;
slider.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

slider.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50 && currentSlide < 3) {
    if (unlocked[currentSlide+1]) {
      currentSlide++;
      slider.style.transform = `translateX(-${currentSlide*100}%)`;
    }
  } else if (endX - startX > 50 && currentSlide > 0) {
    currentSlide--;
    slider.style.transform = `translateX(-${currentSlide*100}%)`;
  }
});

updateLocks();
