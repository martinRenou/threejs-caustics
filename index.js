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

const lightDirection = new THREE.Vector3(0.1, 0.5, 1);
const light = new THREE.DirectionalLight(0xffffff, 1, 100);
light.position.set(lightDirection.x, lightDirection.y, lightDirection.z);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

scene.add(light);

// Light front geometry (used for caustics)
const lightFront = new THREE.PlaneBufferGeometry(3.22, 1., 64, 32);
const offset = new THREE.Vector3(1.61, 0.5, 1.);

const N_AIR = 1.000277;
const N_WATER = 1.333;

const raycaster = new THREE.Raycaster();
const raycastDirection = new THREE.Vector3(-lightDirection.x, -lightDirection.y, -lightDirection.z);
const lfIndexArray = lightFront.getIndex().array;
const lfVertexArray = lightFront.getAttribute('position').array;

// For debugging purpose
const lightFrontHelper = new THREE.Mesh(
  lightFront,
  new THREE.MeshBasicMaterial()
);
lightFrontHelper.position.x = offset.x;
lightFrontHelper.position.y = offset.y;
lightFrontHelper.position.z = offset.z;
lightFrontHelper.material.wireframe = true;
scene.add(lightFrontHelper);

function intersect(point, direction, object) {
  raycaster.set(point, direction);

  return raycaster.intersectObject(object, false);
}

function computeCausticMesh(waterGeometry, floorGeometry) {
  for (let idx = 0; idx < lfIndexArray.length / 3; idx += 3) {
    const triangle = [lfIndexArray[idx], lfIndexArray[idx + 1], lfIndexArray[idx + 2]];

    const v1Index = 3 * triangle[0];
    const v2Index = 3 * triangle[1];
    const v3Index = 3 * triangle[2];

    // Get the three vertices
    const v1 = new THREE.Vector3(
      lfVertexArray[v1Index] + offset.x,
      lfVertexArray[v1Index + 1] + offset.y,
      lfVertexArray[v1Index + 2] + offset.z
    );
    const v2 = new THREE.Vector3(
      lfVertexArray[v2Index] + offset.x,
      lfVertexArray[v2Index + 1] + offset.y,
      lfVertexArray[v1Index + 2] + offset.z
    );
    const v3 = new THREE.Vector3(
      lfVertexArray[v3Index] + offset.x,
      lfVertexArray[v3Index + 1] + offset.y,
      lfVertexArray[v1Index + 2] + offset.z
    );

    const inter1 = intersect(v1, raycastDirection, waterGeometry);
    if (!inter1.length) continue;

    const inter2 = intersect(v2, raycastDirection, waterGeometry);
    if (!inter2.length) continue;

    const inter3 = intersect(v3, raycastDirection, waterGeometry);
    if (!inter3.length) continue;

    // TODO Compute refraction

    const inter4 = intersect(v1, raycastDirection, floorGeometry);
    if (!inter4.length) continue;

    const inter5 = intersect(v2, raycastDirection, floorGeometry);
    if (!inter5.length) continue;

    const inter6 = intersect(v3, raycastDirection, floorGeometry);
    if (!inter6.length) continue;
  }
}


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


// Create floor and walls meshes
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

const N_TIMESTAMPS = 77;
const geometries = [];
const geometryPromises = [];
progress.setAttribute('max', 77);


for (let i = 0; i < N_TIMESTAMPS; i++) {
  const verticesPromise = fetchArray('/data/vertices32_' + i + '.bin', Float32Array);
  const trianglesPromise = fetchArray('/data/triangles32_' + i + '.bin', Uint32Array);

  const promise = Promise.all([verticesPromise, trianglesPromise]).then(([vertices, triangles]) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(triangles, 1));

    geometries[i] = geometry;
    progress.setAttribute('value', parseInt(progress.getAttribute('value')) + 1);
  });

  geometryPromises.push(promise);
}

Promise.all(geometryPromises).then(() => {
  const material = new THREE.MeshBasicMaterial({color: '#87b3d4'});
  material.side = THREE.DoubleSide;
  material.transparent = true;
  material.opacity = 0.7;

  const mesh = new THREE.Mesh(geometries[25], material);
  box.castShadow = true;
  box.receiveShadow = false;

  scene.add(mesh);

  // computeCausticMesh(mesh, floor);

  animate();
});


// Main rendering loop
function animate() {
  renderer.render(scene, camera);

  controls.update();

  window.requestAnimationFrame(animate);
}
