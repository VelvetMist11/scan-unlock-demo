// 状态管理
let unlocked = [false, false, false, false];
let currentSlide = 0;
let animationFrameId = null;
const scenes = [];
const cameras = [];
const renderers = [];
const mixers = [];

// 初始化Three.js场景
function initScene(canvasId, modelPath) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // 创建Three.js核心组件
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 加载模型
    new THREE.GLTFLoader().load(modelPath, (gltf) => {
        scene.add(gltf.scene);

        // 自动适配模型尺寸
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.5;

        camera.position.set(center.x, center.y, cameraZ);
        camera.lookAt(center);

        // 初始化动画
        const mixer = new THREE.AnimationMixer(gltf.scene);
        if (gltf.animations.length) {
            mixer.clipAction(gltf.animations[0]).play();
        }
        mixers.push(mixer);
    });

    scenes.push(scene);
    cameras.push(camera);
    renderers.push(renderer);
}

// 滑动控制
const slider = document.getElementById('slider-container');
const hammer = new Hammer(slider);
hammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

hammer.on('swipeleft', () => {
    if (currentSlide < 3) {
        currentSlide++;
        updateSlider();
    }
});

hammer.on('swiperight', () => {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlider();
    }
});

function updateSlider() {
    slider.style.transform = `translateX(-${currentSlide * 100}vw)`;
    document.querySelectorAll('.dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
    });
}

// 扫码系统
const qrScanner = new Html5Qrcode("qr-reader");
let currentScanTarget = 0;

document.querySelectorAll('.scan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentScanTarget = parseInt(btn.dataset.target);
        document.getElementById('qr-overlay').style.display = 'flex';
        hammer.get('swipe').set({ enable: false });
        
        qrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            decodedText => {
                if (decodedText === `unlock${currentScanTarget + 1}`) {
                    unlocked[currentScanTarget] = true;
                    localStorage.setItem(`unlock${currentScanTarget + 1}`, 'true');
                    updateUI();
                }
                closeScanner();
            }
        ).catch(console.error);
    });
});

document.getElementById('close-scan').addEventListener('click', closeScanner);

function closeScanner() {
    qrScanner.stop();
    document.getElementById('qr-overlay').style.display = 'none';
    hammer.get('swipe').set({ enable: true });
}

// 更新界面状态
function updateUI() {
    unlocked.forEach((state, idx) => {
        const overlay = document.querySelector(`.slide:nth-child(${idx + 1}) .locked-overlay`);
        const btn = document.querySelector(`.slide:nth-child(${idx + 1}) .scan-btn`);
        if (overlay) overlay.style.display = state ? 'none' : 'flex';
        if (btn) btn.style.display = state ? 'none' : 'block';
    });

    if (unlocked[0] && unlocked[1] && unlocked[2]) {
        unlocked[3] = true;
        document.querySelector('.slide:nth-child(4) .locked-overlay').style.display = 'none';
        if (!scenes[3]) initScene('model3', 'docs/models/model4.glb');
    }
}

// 初始化加载
['model0', 'model1', 'model2'].forEach((id, idx) => {
    initScene(id, `models/model${idx + 1}.glb`);
    if (localStorage.getItem(`unlock${idx + 1}`) === 'true') {
        unlocked[idx] = true;
    }
});

// 启动动画循环
const clock = new THREE.Clock();
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    mixers.forEach(mixer => mixer.update(delta));
    scenes.forEach((scene, idx) => renderers[idx]?.render(scene, cameras[idx]));
}
animate();

// 窗口响应
window.addEventListener('resize', () => {
    scenes.forEach((_, idx) => {
        const canvas = document.getElementById(`model${idx}`);
        if (!canvas) return;
        
        cameras[idx].aspect = canvas.clientWidth / canvas.clientHeight;
        cameras[idx].updateProjectionMatrix();
        renderers[idx].setSize(canvas.clientWidth, canvas.clientHeight);
    });
});

// 初始状态更新
updateUI();
