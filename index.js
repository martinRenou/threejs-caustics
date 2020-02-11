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
renderer.setClearColor(new THREE.Color('white'));


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
  geometry.center();

  const material = new THREE.MeshBasicMaterial({color: 'blue'});
  material.side = THREE.DoubleSide;

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
});


function animate() {
  renderer.render(scene, camera);

  controls.update();

  window.requestAnimationFrame(animate);
}
animate();
