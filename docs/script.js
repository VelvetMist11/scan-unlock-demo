let currentIndex = 0;
const totalSlides = 4;
const container = document.getElementById('slider-container');
const dots = document.querySelectorAll('.dot');

function updateSlide(index) {
  container.style.transform = `translateX(-${index * 100}vw)`;
  dots.forEach(dot => dot.classList.remove('active'));
  dots[index].classList.add('active');
}

// 监听触摸滑动
let startX = 0;

container.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

container.addEventListener('touchend', e => {
  let endX = e.changedTouches[0].clientX;
  let deltaX = endX - startX;
  if (deltaX > 50 && currentIndex > 0) {
    currentIndex--;
  } else if (deltaX < -50 && currentIndex < totalSlides - 1) {
    currentIndex++;
  }
  updateSlide(currentIndex);
});

// 初始化Three.js渲染器
for (let i = 0; i < totalSlides; i++) {
  const canvas = document.getElementById(`modelCanvas${i}`);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 1, 1).normalize();
  scene.add(light);

  const loader = new THREE.GLTFLoader();
  loader.load('your_model_path.glb', gltf => {
    scene.add(gltf.scene);
    animate();
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
}

// 扫码按钮
document.querySelectorAll('.scan-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('scanner-overlay').style.display = 'flex';
    const qrReader = new Html5Qrcode("qr-reader");
    qrReader.start({ facingMode: "environment" }, { fps: 10 }, qrCodeMessage => {
      alert(`扫码成功: ${qrCodeMessage}`);
      qrReader.stop();
      document.getElementById('scanner-overlay').style.display = 'none';
    });
  });
});

// 关闭扫码
document.getElementById('backButton').addEventListener('click', () => {
  document.getElementById('scanner-overlay').style.display = 'none';
});
