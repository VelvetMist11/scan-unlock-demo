class PageSlider {
  constructor() {
    this.slider = document.getElementById('slider-container');
    this.pages = Array.from(document.querySelectorAll('.page'));
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.isDragging = false;

    this.initTouchEvents();
    this.initModels();
  }

  initTouchEvents() {
    document.addEventListener('touchstart', e => {
      this.touchStartX = e.touches[0].clientX;
      this.isDragging = true;
      this.slider.style.transition = 'none';
    });

    document.addEventListener('touchmove', e => {
      if (!this.isDragging) return;
      const deltaX = e.touches[0].clientX - this.touchStartX;
      this.slider.style.transform = `translateX(calc(-${this.currentIndex * 100}vw + ${deltaX}px))`;
    });

    document.addEventListener('touchend', e => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.slider.style.transition = '';

      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const threshold = window.innerWidth * 0.15;

      if (Math.abs(deltaX) > threshold) {
        this.currentIndex += deltaX > 0 ? -1 : 1;
        this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.pages.length - 1));
      }

      this.updateSlider();
    });
  }

  updateSlider() {
    this.slider.style.transform = `translateX(-${this.currentIndex * 100}vw)`;
    document.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  initModels() {
    this.pages.forEach((page, index) => {
      const canvas = page.querySelector('.model-canvas');
      this.initThreeJS(canvas, `models/model${index}.glb`);
    });
  }

  initThreeJS(canvas, modelPath) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    const resize = () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', resize);
    resize();

    new THREE.GLTFLoader().load(modelPath, gltf => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 5;
      scene.add(gltf.scene);

      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    }, undefined, err => {
      console.error(`模型加载失败: ${modelPath}`, err);
    });
  }
}

new PageSlider();
