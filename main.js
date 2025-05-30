import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { ARButton } from 'https://unpkg.com/three@0.150.1/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let controller;
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;
let foxModel = null; // Variable para almacenar el modelo cargado
const loader = new GLTFLoader(); // Instancia del loader

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
  
  // Agregar luz direccional para mejor iluminación del modelo
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
  
  // Cargar el modelo del zorro
  loadFoxModel();
}

function loadFoxModel() {
  loader.load(
    './Fox.glb', // Ruta al archivo GLB
    function (gltf) {
      foxModel = gltf.scene;
      console.log('Modelo del zorro cargado exitosamente');
      
      // Opcional: Ajustar el tamaño del modelo si es necesario
      foxModel.scale.set(0.5, 0.5, 0.5); // Escala el modelo al 50%
      
      // Opcional: Si el modelo tiene animaciones, puedes configurarlas aquí
      if (gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(foxModel);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
        
        // Necesitarías actualizar el mixer en el loop de animación
        // mixer.update(deltaTime);
      }
    },
    function (progress) {
      console.log('Progreso de carga:', (progress.loaded / progress.total * 100) + '%');
    },
    function (error) {
      console.error('Error cargando el modelo:', error);
    }
  );
}

function onSelect() {
  if (reticle.visible && foxModel) {
    // Clonar el modelo para crear una nueva instancia
    const foxClone = foxModel.clone();
    
    // Posicionar el zorro en la ubicación del reticle
    foxClone.position.setFromMatrixPosition(reticle.matrix);
    foxClone.quaternion.setFromRotationMatrix(reticle.matrix);
    
    // Agregar el zorro a la escena
    scene.add(foxClone);
    
    console.log('Zorro colocado en la escena');
  } else if (reticle.visible && !foxModel) {
    console.log('El modelo del zorro aún no se ha cargado');
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
