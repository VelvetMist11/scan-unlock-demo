class PageSlider {
  constructor() {
    this.slider = document.getElementById('slider-container');
    this.pages  = Array.from(document.querySelectorAll('.page'));
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.isDragging  = false;

    this.initTouchEvents();
    this.initModels();
    this.initScanButtons();
  }

  initTouchEvents() {
    document.addEventListener('touchstart', e => {
      this.touchStartX = e.touches[0].clientX;
      this.isDragging  = true;
      // 禁用过渡以获得实时拖动效果
      this.slider.style.transition = 'none';
    });

    document.addEventListener('touchmove', e => {
      if (!this.isDragging) return;
      // 🔒 阻止系统默认拖动（地图滚动）行为
      e.preventDefault();
      let deltaX = e.touches[0].clientX - this.touchStartX;
      this.slider.style.transform = `translateX(calc(-${this.currentIndex} * 100vw + ${deltaX}px))`;
    }, {passive:false});

    document.addEventListener('touchend', e => {
      if (!this.isDragging) return;
      this.isDragging = false;
      // 恢复过渡动画
      this.slider.style.transition = 'transform 0.3s ease';

      let deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const threshold = window.innerWidth * 0.15;
      if (deltaX < -threshold)       this.currentIndex = Math.min(this.currentIndex+1, this.pages.length-1);
      else if (deltaX > threshold)   this.currentIndex = Math.max(this.currentIndex-1, 0);

      this.updateSlider();
    });
  }

  updateSlider() {
    this.slider.style.transform = `translateX(-${this.currentIndex}00vw)`;
    document.querySelectorAll('.dot')
      .forEach((d,i) => d.classList.toggle('active', i===this.currentIndex));
  }

  initModels() {
    document.querySelectorAll('.model-canvas').forEach((canvas,i) =>
      initThreeJS(canvas, `models/model${i}.glb`)
    );
  }

  initScanButtons() {
    document.querySelectorAll('.scan-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('qr-overlay').style.display = 'flex';
      });
    });
    document.getElementById('close-scan').addEventListener('click', () => {
      document.getElementById('qr-overlay').style.display = 'none';
    });
  }
}

// 对应的 Three.js 初始化函数，此处略
new PageSlider();
