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
  
  // Cargar el GLTFLoader de forma dinámica
  loadGLTFLoader();
}

async function loadGLTFLoader() {
  try {
    // Cargar GLTFLoader dinámicamente
    const GLTFLoaderModule = await import('https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/GLTFLoader.js');
    const GLTFLoader = GLTFLoaderModule.GLTFLoader;
    
    const loader = new GLTFLoader();
    
    loader.load(
      './Fox.glb',
      function (gltf) {
        foxModel = gltf.scene;
        console.log('Zorro cargado correctamente');
        foxModel.scale.set(0.5, 0.5, 0.5);
      },
      function (progress) {
        console.log('Cargando zorro...', Math.round((progress.loaded / progress.total) * 100) + '%');
      },
      function (error) {
        console.error('Error cargando el zorro:', error);
        // Si falla, crear un zorro simple con geometrías básicas
        createSimpleFox();
      }
    );
  } catch (error) {
    console.error('Error cargando GLTFLoader:', error);
    // Si no se puede cargar el GLTFLoader, crear un zorro simple
    createSimpleFox();
  }
}

function createSimpleFox() {
  console.log('Creando zorro simple con geometrías básicas');
  
  const foxGroup = new THREE.Group();
  
  // Cuerpo del zorro
  const bodyGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.6);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, 0.075, 0);
  foxGroup.add(body);
  
  // Cabeza del zorro
  const headGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.25);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(0, 0.175, 0.35);
  foxGroup.add(head);
  
  // Hocico
  const snoutGeometry = new THREE.BoxGeometry(0.1, 0.08, 0.15);
  const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
  snout.position.set(0, 0.15, 0.47);
  foxGroup.add(snout);
  
  // Orejas
  const earGeometry = new THREE.ConeGeometry(0.06, 0.15, 4);
  const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
  leftEar.position.set(-0.08, 0.28, 0.32);
  foxGroup.add(leftEar);
  
  const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
  rightEar.position.set(0.08, 0.28, 0.32);
  foxGroup.add(rightEar);
  
  // Cola
  const tailGeometry = new THREE.ConeGeometry(0.08, 0.4, 8);
  const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xff4400 });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.set(0, 0.1, -0.35);
  tail.rotation.x = Math.PI / 4;
  foxGroup.add(tail);
  
  // Patas
  const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.15);
  const legMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  
  const positions = [
    [-0.12, -0.075, 0.2],   // pata delantera izquierda
    [0.12, -0.075, 0.2],    // pata delantera derecha
    [-0.12, -0.075, -0.2],  // pata trasera izquierda
    [0.12, -0.075, -0.2]    // pata trasera derecha
  ];
  
  positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos[0], pos[1], pos[2]);
    foxGroup.add(leg);
  });
  
  foxModel = foxGroup;
  console.log('Zorro simple creado');
}

function onSelect() {
  if (reticle.visible && foxModel) {
    const foxClone = foxModel.clone();
    foxClone.position.setFromMatrixPosition(reticle.matrix);
    foxClone.quaternion.setFromRotationMatrix(reticle.matrix);
    scene.add(foxClone);
    console.log('Zorro colocado en la escena');
  } else if (reticle.visible && !foxModel) {
    console.log('El zorro aún no está listo');
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
