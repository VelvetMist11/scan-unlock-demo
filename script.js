// script.js （ES Modules）
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.174.0/examples/jsm/loaders/GLTFLoader.js';

// 全局状态
const pages       = document.querySelectorAll('.page');
const totalPages  = pages.length;
const dots        = document.querySelectorAll('.dot');
let   currentIndex= 0;
const unlocked    = Array(totalPages).fill(false);

// 滑动翻页
let startX, isDragging=false;
const slider = document.getElementById('slider-container');
document.addEventListener('touchstart', e=>{
  startX = e.touches[0].clientX; isDragging=true;
  slider.style.transition='none';
});
document.addEventListener('touchmove', e=>{
  if(!isDragging) return;
  e.preventDefault(); // 禁止页面拖动
  const delta = e.touches[0].clientX - startX;
  slider.style.transform = `translateX(calc(-${currentIndex*100}vw + ${delta}px))`;
},{passive:false});
document.addEventListener('touchend', e=>{
  if(!isDragging) return;
  isDragging=false;
  slider.style.transition='transform 0.4s ease';
  const delta = e.changedTouches[0].clientX - startX;
  if(delta < -50) currentIndex = Math.min(currentIndex+1, totalPages-1);
  else if(delta > 50) currentIndex = Math.max(currentIndex-1, 0);
  goToPage(currentIndex);
});

// 更新页面和指示器
function goToPage(i){
  slider.style.transform = `translateX(-${i*100}vw)`;
  dots.forEach((d,idx)=> d.classList.toggle('active', idx===i));
}

// Three.js 初始化
pages.forEach((page, idx)=>{
  const canvas = page.querySelector('.model-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(45,1,0.1,1000);
  camera.position.z = 5;
  scene.add(new THREE.AmbientLight(0xffffff,0.8));
  const dir = new THREE.DirectionalLight(0xffffff,1);
  dir.position.set(5,5,5);
  scene.add(dir);

  const resize = ()=>{
    const w=canvas.clientWidth, h=canvas.clientHeight;
    renderer.setSize(w,h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    camera.aspect = w/h; camera.updateProjectionMatrix();
  };
  window.addEventListener('resize',resize);
  resize();

  new GLTFLoader().load(`models/model${idx}.glb`, gltf=>{
    // 模型居中
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
    scene.add(gltf.scene);
  });

  // 渲染循环
  (function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
  })();
});

// html5‑qrcode 解锁逻辑
const qrOverlay = document.getElementById('qr-overlay');
const qrReader  = document.getElementById('qr-reader');
let   qrCode    = null;

// 点击扫码按钮
document.querySelectorAll('.scan-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const idx = +btn.dataset.target;
    // 显示全屏预览
    qrOverlay.style.display = 'flex';
    // 禁用滑动
    isDragging = false;
    // 启动摄像头
    qrCode = new Html5Qrcode("qr-reader");
    qrCode.start(
      { facingMode: "environment" },
      { fps:10, qrbox:250 },
      decoded=>{
        if(decoded === `UNLOCK${idx}`){
          qrCode.stop().then(()=>qrCode.clear());
          qrOverlay.style.display = 'none';
          // 解锁本页：移除模糊 & 隐藏按钮
          pages[idx].style.backdropFilter = 'none';
          btn.style.display = 'none';
          unlocked[idx]=true;
          // 自动解锁第四页
          if(unlocked[0]&&unlocked[1]&&unlocked[2]){
            pages[3].style.backdropFilter='none';
            document.querySelector('[data-target="3"]').style.display='none';
            unlocked[3]=true;
          }
        }
      }
    );
  });
});

// 关闭扫码预览
document.getElementById('close-scan').addEventListener('click', ()=>{
  if(qrCode) qrCode.stop().catch(()=>{}).then(()=>qrCode.clear());
  qrOverlay.style.display = 'none';
});
