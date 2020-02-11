console.log(THREE);

const canvas = document.getElementById('canvas');
console.log(canvas);

const width = canvas.width;
const height = canvas.height;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({canvas: canvas});
renderer.setSize(width, height);


const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;


function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
}
animate();
