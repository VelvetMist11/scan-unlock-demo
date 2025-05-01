class SliderController {
    constructor() {
        this.slider = document.getElementById('slider-container');
        this.pages = document.querySelectorAll('.page');
        this.currentIndex = 0;
        this.startX = 0;
        this.isDragging = false;
        
        this.initEventListeners();
        this.initThreeJS();
    }

    initEventListeners() {
        // 触摸事件
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // 扫码按钮
        document.querySelectorAll('.scan-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('qr-overlay').style.display = 'flex';
            });
        });

        // 关闭扫码
        document.getElementById('close-scan').addEventListener('click', () => {
            document.getElementById('qr-overlay').style.display = 'none';
        });
    }

    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
        this.slider.style.transition = 'none';
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - this.startX;
        
        // 实时拖动效果
        this.slider.style.transform = `translateX(calc(-${this.currentIndex * 100}vw + ${deltaX}px))`;
        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const deltaX = e.changedTouches[0].clientX - this.startX;
        const threshold = window.innerWidth * 0.15; // 15%滑动阈值

        if (Math.abs(deltaX) > threshold) {
            this.currentIndex += deltaX > 0 ? -1 : 1;
            this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.pages.length - 1));
        }
        
        this.updateSlider();
    }

    updateSlider() {
        this.slider.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        this.slider.style.transform = `translateX(-${this.currentIndex * 100}vw)`;
        
        // 更新分页指示器
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    initThreeJS() {
        const modelPaths = [
            'models/model0.glb',
            'models/model1.glb',
            'models/model2.glb',
            'models/model3.glb'
        ];

        modelPaths.forEach((path, index) => {
            const canvas = document.getElementById(`model${index}`);
            if (!canvas) return;

            const renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });
            
            // 尺寸适配
            const resize = () => {
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            };
            window.addEventListener('resize', resize);
            resize();

            // 模型加载
            new THREE.GLTFLoader().load(path, (gltf) => {
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(
                    45,
                    canvas.clientWidth / canvas.clientHeight,
                    0.1,
                    1000
                );
                
                // 自动居中模型
                const box = new THREE.Box3().setFromObject(gltf.scene);
                const center = box.getCenter(new THREE.Vector3());
                gltf.scene.position.sub(center);
                
                // 调整相机位置
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                camera.position.z = maxDim * 2;
                
                scene.add(gltf.scene);
                scene.add(new THREE.AmbientLight(0xffffff, 0.8));

                // 渲染循环
                const animate = () => {
                    requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                };
                animate();
            }, undefined, (err) => {
                console.error(`模型加载失败: ${path}`, err);
            });
        });
    }
}

// 初始化
new SliderController();
