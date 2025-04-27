let currentIndex = 0;
const totalSlides = 4;
let unlockedSlides = [false, false, false, false];
let qrScanner;
let scanTarget = 0;

// 分页指示器更新
function updatePagination() {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentIndex);
  });
}

// 滑动切换
function goToSlide(index) {
  const slider = document.getElementById('slider-container');
  slider.style.transform = `translateX(-${index * 100}vw)`;
  currentIndex = index;
  updatePagination();
}

// 初始化 Three.js（这里可以根据需要修改）
function initThreeJS(canvasId) {
  const canvas = document.getElementById(canvasId);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const loader = new THREE.GLTFLoader();
  loader.load('model.glb', function(gltf) {
    scene.add(gltf.scene);
    animate();
  }, undefined, function(error) {
    console.error(error);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
}

// 绑定扫码按钮
document.querySelectorAll('.scan-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    scanTarget = parseInt(this.getAttribute('data-target'));
    document.getElementById('qr-overlay').style.display = 'flex';

    if (!qrScanner) {
      qrScanner = new Html5Qrcode("qr-reader");
    }

    qrScanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      qrCodeMessage => {
        if (qrCodeMessage) {
          unlockSlide(scanTarget);
          qrScanner.stop();
          document.getElementById('qr-overlay').style.display = 'none';
        }
      },
      errorMessage => {
        // 扫码错误可以忽略
      }
    );
  });
});

// 解锁
function unlockSlide(index) {
  unlockedSlides[index] = true;
  document.querySelectorAll('.locked-overlay')[index].style.display = 'none';
}

// 关闭扫码界面
document.getElementById('close-scan').addEventListener('click', function() {
  if (qrScanner) {
    qrScanner.stop();
  }
  document.getElementById('qr-overlay').style.display = 'none';
});

// 滑动监听（简单示范，可以完善）
let startX = 0;
document.getElementById('slider-container').addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

document.getElementById('slider-container').addEventListener('touchend', e => {
  let endX = e.changedTouches[0].clientX;
  if (endX < startX - 50) {
    goToSlide(Math.min(currentIndex + 1, totalSlides - 1));
  } else if (endX > startX + 50) {
    goToSlide(Math.max(currentIndex - 1, 0));
  }
});

// 初始化所有模型（可选，可以按需加载）
for (let i = 0; i < totalSlides; i++) {
  initThreeJS('model' + i);
}
