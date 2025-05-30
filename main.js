import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let controller;
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;

let foxModel = null;
let rabbitModel = null;
let birdModel = null;

let currentModelFactory = createFox;

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

  // Cargar modelos iniciales
  createFox();
  createRabbit();
  createBird();
}

function onSelect() {
  if (reticle.visible && currentModelFactory && currentModelFactory.model) {
    const clone = currentModelFactory.model.clone();
    clone.position.setFromMatrixPosition(reticle.matrix);
    clone.quaternion.setFromRotationMatrix(reticle.matrix);
    scene.add(clone);
  }
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(_, frame) {
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if (!hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then(refSpace => {
        session.requestHitTestSource({ space: refSpace }).then(source => {
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

// ----- Selector de animales -----
window.setAnimal = function (animal) {
  switch (animal) {
    case 'fox': currentModelFactory = createFox; break;
    case 'rabbit': currentModelFactory = createRabbit; break;
    case 'bird': currentModelFactory = createBird; break;
  }
};

// ----- Zorro -----
function createFox() {
  const foxGroup = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 0.8, 16),
    new THREE.MeshPhongMaterial({ color: 0xcc5500 })
  );
  body.rotation.x = Math.PI / 2;
  body.position.set(0, 0.1, 0);
  foxGroup.add(body);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.25, 0.3),
    body.material
  );
  head.position.set(0, 0.21, 0.42);
  foxGroup.add(head);

  const snout = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.1, 0.2),
    new THREE.MeshPhongMaterial({ color: 0xffddb3 })
  );
  snout.position.set(0, 0.19, 0.6);
  foxGroup.add(snout);

  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 8, 8),
    new THREE.MeshPhongMaterial({ color: 0x000000 })
  );
  nose.position.set(0, 0.2, 0.72);
  foxGroup.add(nose);

  const earGeometry = new THREE.ConeGeometry(0.08, 0.2, 6);
  const earMaterial = new THREE.MeshPhongMaterial({ color: 0xdd4400 });

  const leftEar = new THREE.Mesh(earGeometry, earMaterial);
  leftEar.position.set(-0.1, 0.35, 0.37);
  leftEar.rotation.set(-0.5, 0, -0.2);
  foxGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeometry, earMaterial);
  rightEar.position.set(0.1, 0.35, 0.37);
  rightEar.rotation.set(-0.5, 0, 0.2);
  foxGroup.add(rightEar);

  const innerEarGeometry = new THREE.ConeGeometry(0.04, 0.12, 6);
  const innerEarMaterial = new THREE.MeshPhongMaterial({ color: 0xffccaa });

  const leftInner = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
  leftInner.position.set(-0.1, 0.32, 0.39);
  leftInner.rotation.set(-0.5, 0, -0.2);
  foxGroup.add(leftInner);

  const rightInner = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
  rightInner.position.set(0.1, 0.32, 0.39);
  rightInner.rotation.set(-0.5, 0, 0.2);
  foxGroup.add(rightInner);

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.6, 8),
    new THREE.MeshPhongMaterial({ color: 0xdd4400 })
  );
  tail.position.set(0, 0.2, -0.45);
  tail.rotation.x = Math.PI / 4;
  foxGroup.add(tail);

  const tailTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  tailTip.position.set(0, 0.48, -0.73);
  foxGroup.add(tailTip);

  const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.2);
  const hoofGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const legMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const hoofMat = new THREE.MeshPhongMaterial({ color: 0x444444 });

  [
    [-0.15, -0.05, 0.3], [0.15, -0.05, 0.3],
    [-0.15, -0.05, -0.3], [0.15, -0.05, -0.3]
  ].forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMat);
    leg.position.set(...pos);
    foxGroup.add(leg);
    const hoof = new THREE.Mesh(hoofGeometry, hoofMat);
    hoof.position.set(pos[0], -0.15, pos[2]);
    foxGroup.add(hoof);
  });

  const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const eyeMat = new THREE.MeshPhongMaterial({ color: 0x000000 });

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.07, 0.25, 0.55);
  foxGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.07, 0.25, 0.55);
  foxGroup.add(rightEye);

  foxModel = foxGroup;
  createFox.model = foxModel;
}

// ----- Conejo -----
function createRabbit() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  body.position.set(0, 0.1, 0);
  group.add(body);

  const earGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
  const earMat = new THREE.MeshPhongMaterial({ color: 0xffcccc });

  const leftEar = new THREE.Mesh(earGeo, earMat);
  leftEar.position.set(-0.05, 0.3, 0);
  group.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, earMat);
  rightEar.position.set(0.05, 0.3, 0);
  group.add(rightEar);

  rabbitModel = group;
  createRabbit.model = rabbitModel;
}

// ----- Pájaro -----
function createBird() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0x66ccff })
  );
  body.position.set(0, 0.1, 0);
  group.add(body);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.03, 0.1, 8),
    new THREE.MeshPhongMaterial({ color: 0xffaa00 })
  );
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.1, 0.18);
  group.add(beak);

  birdModel = group;
  createBird.model = birdModel;
}
