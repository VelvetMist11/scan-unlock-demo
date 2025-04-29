class PageSlider {
  constructor() {
    this.slider = document.getElementById('slider-container')
    this.pages = Array.from(document.querySelectorAll('.page'))
    this.currentIndex = 0
    this.touchStartX = 0
    this.isDragging = false
    
    // 事件绑定
    this.initTouchEvents()
    this.initModels()
  }

  initTouchEvents() {
    document.addEventListener('touchstart', e => {
      this.touchStartX = e.touches[0].clientX
      this.isDragging = true
      this.slider.style.transition = 'none' // 拖动时禁用动画
    })

    document.addEventListener('touchmove', e => {
      if (!this.isDragging) return
      const deltaX = e.touches[0].clientX - this.touchStartX
      this.slider.style.transform = `translateX(calc(-${this.currentIndex * 100}vw + ${deltaX}px))`
    })

    document.addEventListener('touchend', e => {
      if (!this.isDragging) return
      this.isDragging = false
      this.slider.style.transition = '' // 恢复动画

      const deltaX = e.changedTouches[0].clientX - this.touchStartX
      const threshold = window.innerWidth * 0.15 // 15%滑动阈值

      if (Math.abs(deltaX) > threshold) {
        this.currentIndex += deltaX > 0 ? -1 : 1
        this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.pages.length - 1))
      }
      
      this.updateSlider()
    })
  }

  updateSlider() {
    this.slider.style.transform = `translateX(-${this.currentIndex * 100}vw)`
    document.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex)
    })
  }

  initModels() {
    this.pages.forEach((page, index) => {
      const canvas = page.querySelector('.model-canvas')
      this.initThreeJS(canvas, `models/model${index}.glb`)
    })
  }

  initThreeJS(canvas, modelPath) {
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    })
    
    // 尺寸适配逻辑
    const resize = () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    window.addEventListener('resize', resize)
    resize()

    // 模型加载逻辑
    new THREE.GLTFLoader().load(modelPath, gltf => {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
      camera.position.z = 5
      scene.add(gltf.scene)

      // 自动居中模型
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const center = box.getCenter(new THREE.Vector3())
      gltf.scene.position.sub(center)

      // 渲染循环
      const animate = () => {
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }
      animate()
    }, undefined, err => {
      console.error(`模型加载失败: ${modelPath}`, err)
    })
  }
}

// 初始化
new PageSlider()
