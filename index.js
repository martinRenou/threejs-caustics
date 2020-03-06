const canvas = document.getElementById('canvas');
const progress = document.getElementById('progress');

const width = canvas.width;
const height = canvas.height;


// Create Scene and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(1.682, 3.130, 1.102);
camera.rotation.set(-1.283, 0.024, 3.104);
camera.up.set(0, -1, 0);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setSize(width, height);

// Create mouse Controls
const controls = new THREE.TrackballControls(
  camera,
  canvas
);

controls.screen.width = width;
controls.screen.height = height;

controls.rotateSpeed = 2.5;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.9;
controls.dynamicDampingFactor = 0.9;

// Main rendering loop
function animate() {
  renderer.render(scene, camera);

  controls.update();

  window.requestAnimationFrame(animate);
}

animate();
