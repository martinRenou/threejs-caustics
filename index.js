const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;


// Create Scene and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(1.682, 3.130, 1.102);
camera.rotation.set(-1.283, 0.024, 3.104);
camera.up.set(0, -1, 0);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;


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
const ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);

var light = new THREE.DirectionalLight(0xffffff, 1, 100);
light.position.set(0.1, 0.5, 1);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

scene.add(light);

// Create obstacle mesh
const box = new THREE.Mesh(
  new THREE.BoxGeometry(0.16, 0.4, 0.16),
  new THREE.MeshStandardMaterial()
);
box.position.x = 2.47;
box.position.y = 0.5;
box.position.z = 0.08;
box.castShadow = true;
box.receiveShadow = false;
scene.add(box);

// Create bounds meshes
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(3.22, 1.),
  new THREE.MeshStandardMaterial()
);
floor.position.x = 1.61;
floor.position.y = 0.5;
floor.position.z = 0.0;
floor.castShadow = false;
floor.receiveShadow = true;
scene.add(floor);

const wall1 = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(3.22, 1.),
  new THREE.MeshStandardMaterial()
);
wall1.position.x = 1.61;
wall1.position.y = 1.;
wall1.position.z = 0.5;
wall1.rotateX(Math.PI / 2.);
wall1.castShadow = false;
wall1.receiveShadow = true;
scene.add(wall1);

const wall2 = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(3.22, 1.),
  new THREE.MeshStandardMaterial()
);
wall2.position.x = 1.61;
wall2.position.y = 0.0;
wall2.position.z = 0.5;
wall2.rotateX(- Math.PI / 2.);
wall2.castShadow = false;
wall2.receiveShadow = true;
scene.add(wall2);

const wall3 = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1., 1.),
  new THREE.MeshStandardMaterial()
);
wall3.position.x = 0.0;
wall3.position.y = 0.5;
wall3.position.z = 0.5;
wall3.rotateY(Math.PI / 2.);
wall3.castShadow = false;
wall3.receiveShadow = true;
scene.add(wall3);

const wall4 = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1., 1.),
  new THREE.MeshStandardMaterial()
);
wall4.position.x = 3.22;
wall4.position.y = 0.5;
wall4.position.z = 0.5;
wall4.rotateY(- Math.PI / 2.);
wall4.castShadow = false;
wall4.receiveShadow = true;
scene.add(wall4);


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
  box.castShadow = true;
  box.receiveShadow = false;

  scene.add(mesh);
});


// Main rendering loop
function animate() {
  renderer.render(scene, camera);

  controls.update();

  window.requestAnimationFrame(animate);
}
animate();
