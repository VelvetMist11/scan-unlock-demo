import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';

class SliderController {
  constructor(container, pages, indicator, qrButtons, qrContainers) {
    this.container = container;
    this.pages = pages;
    this.indicator = indicator;
    this.qrButtons = qrButtons;
    this.qrContainers = qrContainers;
    this.currentIndex = 0;
    this.totalPages = this.pages.children.length;
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;

    this.init();
  }

  init() {
    this.container.addEventListener('touchstart', this.touchStart.bind(this));
    this.container.addEventListener('touchmove', this.touchMove.bind(this));
    this.container.addEventListener('touchend', this.touchEnd.bind(this));
    this.updateView();

    this.qrButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.qrContainers[index].style.display = 'block';
      });
    });

    this.qrContainers.forEach(container => {
      container.querySelector('.close-btn').addEventListener('click', () => {
        container.style.display = 'none';
      });
    });
  }

  touchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
  }

  touchMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.touches[0].clientX;
  }

  touchEnd(e) {
    if (!this.isDragging) return;
    const dx = this.currentX - this.startX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) {
        this.nextPage();
      } else {
        this.prevPage();
      }
    }
    this.isDragging = false;
  }

  nextPage() {
    if (this.currentIndex < this.totalPages - 1) {
      this.currentIndex++;
      this.updateView();
    }
  }

  prevPage() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateView();
    }
  }

  updateView() {
    const offset = -this.currentIndex * 100;
    this.pages.style.transform = `translateX(${offset}vw)`;
    this.indicator.textContent = `${this.currentIndex + 1} / ${this.totalPages}`;
  }
}

class ModelViewer {
  constructor(canvas, modelPath) {
    this.canvas = canvas;
    this.modelPath = modelPath;
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);

    const loader = new GLTFLoader();
    loader.load(this.modelPath, (gltf) => {
      const model = gltf.scene;
      this.scene.add(model);
      model.position.set(0, 0, 0);
      model.rotation.y = Math.PI;
      this.camera.position.set(0, 1.5, 3);
      this.animate();
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

// 初始化逻辑
window.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const pages = document.querySelector('.pages');
  const indicator = document.querySelector('.page-indicator');
  const qrButtons = document.querySelectorAll('.qr-button');
  const qrContainers = document.querySelectorAll('.qr-container');

  new SliderController(container, pages, indicator, qrButtons, qrContainers);

  const canvasList = document.querySelectorAll('canvas');
  const modelPaths = ['models/model0.glb', 'models/model1.glb', 'models/model2.glb'];
  canvasList.forEach((canvas, index) => {
    new ModelViewer(canvas, modelPaths[index]);
  });
});
