import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let controller;
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;
let foxModel = null;

init();
animate();

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);
  
  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));
  
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);
  
  controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);
  
  const geometry = new THREE.RingGeometry(0.1, 0.11, 32).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x0fff0f });
  reticle = new THREE.Mesh(geometry, material);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
  
  // Crear el zorro directamente
  createFox();
}

function createFox() {
  console.log('Creando zorro con geometrías básicas');
  
  const foxGroup = new THREE.Group();
  
  // Cuerpo principal (más realista)
  const bodyGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, 0.1, 0);
  foxGroup.add(body);
  
  // Cabeza más proporcionada
  const headGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.3);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(0, 0.225, 0.45);
  foxGroup.add(head);
  
  // Hocico más alargado
  const snoutGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.2);
  const snoutMaterial = new THREE.MeshPhongMaterial({ color: 0xffaa77 });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.position.set(0, 0.2, 0.65);
  foxGroup.add(snout);
  
  // Nariz negra
  const noseGeometry = new THREE.SphereGeometry(0.025, 8, 8);
  const noseMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, 0.22, 0.75);
  foxGroup.add(nose);
  
  // Orejas más grandes y puntiagudas
  const earGeometry = new THREE.ConeGeometry(0.08, 0.2, 6);
  const earMaterial = new THREE.MeshPhongMaterial({ color: 0xff4400 });
  
  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.position.set(-0.1, 0.35, 0.4);
  leftEar.rotation.z = -0.2;
  foxGroup.add(leftEar);
  
  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  rightEar.position.set(0.1, 0.35, 0.4);
  rightEar.rotation.z = 0.2;
  foxGroup.add(rightEar);
  
  // Interior de las orejas
  const innerEarGeometry = new THREE.ConeGeometry(0.04, 0.12, 6);
  const innerEarMaterial = new THREE.MeshPhongMaterial({ color: 0xffccaa });
  
  const leftInnerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
  leftInnerEar.position.set(-0.1, 0.32, 0.42);
  leftInnerEar.rotation.z = -0.2;
  foxGroup.add(leftInnerEar);
  
  const rightInnerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
  rightInnerEar.position.set(0.1, 0.32, 0.42);
  rightInnerEar.rotation.z = 0.2;
  foxGroup.add(rightInnerEar);
  
  // Cola más peluda y realista
  const tailGeometry = new THREE.ConeGeometry(0.12, 0.6, 8);
  const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xff4400 });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.set(0, 0.15, -0.5);
  tail.rotation.x = Math.PI / 6;
  foxGroup.add(tail);
  
  // Punta blanca de la cola
  const tailTipGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const tailTipMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const tailTip = new THREE.Mesh(tailTipGeometry, tailTipMaterial);
  tailTip.position.set(0, 0.35, -0.7);
  foxGroup.add(tailTip);
  
  // Patas más realistas
  const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.2);
  const legMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  
  // Pezuñas
  const hoofGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const hoofMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
  
  const legPositions = [
    [-0.15, 0, 0.3],    // delantera izquierda
    [0.15, 0, 0.3],     // delantera derecha
    [-0.15, 0, -0.3],   // trasera izquierda
    [0.15, 0, -0.3]     // trasera derecha
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    foxGroup.add(leg);
    
    const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
    hoof.position.set(pos[0], -0.08, pos[2]);
    foxGroup.add(hoof);
  });
  
  // Ojos
  const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.08, 0.25, 0.58);
  foxGroup.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.08, 0.25, 0.58);
  foxGroup.add(rightEye);
  
  foxModel = foxGroup;
  console.log('Zorro creado y listo para usar');
}

function onSelect() {
  if (reticle.visible && foxModel) {
    const foxClone = foxModel.clone();
    foxClone.position.setFromMatrixPosition(reticle.matrix);
    foxClone.quaternion.setFromRotationMatrix(reticle.matrix);
    scene.add(foxClone);
    console.log('Zorro colocado en la escena');
  }
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();
    
    if (!hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((refSpace) => {
        session.requestHitTestSource({ space: refSpace }).then((source) => {
          hitTestSource = source;
        });
      });
      
      session.addEventListener('end', () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });
      
      hitTestSourceRequested = true;
    }
    
    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      
      if (hitTestResults.length) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
  }
  
  renderer.render(scene, camera);
}
