// 解锁状态
const unlocked = [false, false, false, false];

// 预设二维码内容
const expected = ["UNLOCK0","UNLOCK1","UNLOCK2","UNLOCK3"];

// 逐页初始化 Three.js
for (let i = 0; i < 4; i++) {
  initThree(`canvas${i}`, `models/model${i}.glb`);
}

// 扫码实例存储
const scanners = {};

// 按钮 & 关闭绑定
document.querySelectorAll('.scan-btn').forEach(btn => {
  const idx = btn.dataset.page;
  const overlay = document.getElementById(`overlay${idx}`);
  const readerId = `reader${idx}`;

  // 点击“扫码解锁”
  btn.onclick = () => {
    document.body.style.overflow = 'hidden';  // 禁止滚动
    overlay.style.display = 'flex';
    scanners[idx] = new Html5Qrcode(readerId);
    scanners[idx].start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      text => {
        if (text === expected[idx]) {
          scanners[idx].stop().then(() => {
            overlay.style.display = 'none';
            unlocked[idx] = true;
            btn.disabled = true;
            btn.textContent = '已解锁';
            checkFourthUnlock();
          });
        }
      },
      _err => {}
    ).catch(console.error);
  };

  // 点击“关闭”
  overlay.querySelector('.close-scan').onclick = () => {
    scanners[idx]?.stop().catch(()=>{});
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  };
}

// 三个解锁后，自动解锁第四页
function checkFourthUnlock() {
  if (unlocked[0] && unlocked[1] && unlocked[2] && !unlocked[3]) {
    unlocked[3] = true;
    document.getElementById('overlay3').style.display = 'none';
    const btn3 = document.querySelector('.scan-btn[data-page="3"]');
    btn3.disabled = true;
    btn3.textContent = '已解锁';
  }
}

// Three.js 基础初始化
function initThree(containerId, modelPath) {
  const container = document.getElementById(containerId);
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0,1,3);
  scene.add(new THREE.AmbientLight(0xffffff,1));

  const light = new THREE.DirectionalLight(0xffffff,1);
  light.position.set(5,10,7);
  scene.add(light);

  new THREE.GLTFLoader().load(modelPath, gltf => {
    scene.add(gltf.scene);
  },undefined,console.error);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  // 自适应
  window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  });
}
