const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;


// Create Scene and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 2;
camera.position.y = -3;

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
controls.target.set(1.61, 0.25, 0.25);


// Create lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);


// Create bounds meshes
const box = new THREE.Mesh(
  new THREE.BoxGeometry(0.16, 0.4, 0.16),
  new THREE.MeshBasicMaterial()
);
box.position.x = 2.47
box.position.y = 0.5
box.position.z = 0.08
scene.add(box);

const boundaries = new THREE.Mesh(
    new THREE.BoxGeometry(3.22, 1., 1.),
    new THREE.MeshBasicMaterial()
);
boundaries.material.side = THREE.BackSide;
boundaries.position.x = 1.61
boundaries.position.y = 0.5
boundaries.position.z = 0.5
scene.add(boundaries);


// Function that fetches the buffers (vertices/triangle indices)
function fetchArray(filename, type) {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    oReq.open('GET', filename, true);
    oReq.responseType = 'arraybuffer';

    oReq.onload = function (oEvent) {
      const arrayBuffer = oReq.response;
      if (arrayBuffer) {
        resolve(new type(arrayBuffer));
      } else {
        reject('Did not get proper response for ' + filename);
      }
    };

    oReq.onerror = function() {
      reject('Could not get ' + filename);
    };

    oReq.send(null);
  });
}

Promise.all([fetchArray('/data/vertices32_25.bin', Float32Array), fetchArray('/data/triangles32_25.bin', Uint32Array)]).then(([vertices, triangles]) => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(triangles, 1));

  const material = new THREE.MeshBasicMaterial({color: '#87b3d4'});
  material.side = THREE.DoubleSide;
  material.transparent = true;
  material.opacity = 0.7;

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
});


// Main rendering loop
function animate() {
  renderer.render(scene, camera);

  controls.update();

  window.requestAnimationFrame(animate);
}
animate();
