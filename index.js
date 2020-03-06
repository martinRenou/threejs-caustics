const canvas = document.getElementById('canvas');

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

// Cube map
const cubetextureloader = new THREE.CubeTextureLoader();

const textureCube = cubetextureloader.load([
  'xpos.jpg', 'xneg.jpg',
  'ypos.jpg', 'ypos.jpg',
  'zpos.jpg', 'zneg.jpg',
]);

// Usage:
// const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );


function loadFile(filename) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FileLoader();

    loader.load(filename, (data) => {
      resolve(data);
    });
  });
}


class Water {

  constructor() {
    this.geometry = new THREE.PlaneBufferGeometry();

    this.textureA = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this.textureB = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});

    const shadersPromises = [
      loadFile('shaders/water_vertexshader.glsl'),
      loadFile('shaders/water_drop_fragmentshader.glsl'),
      loadFile('shaders/water_normal_fragmentshader.glsl'),
      loadFile('shaders/water_update_fragmentshader.glsl'),
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, dropFragmentShader, normalFragmentShader, updateFragmentShader]) => {
      this.dropMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            center: { value: [0, 0] },
            radius: { value: 0 },
            strength: { value: 0 }
        },
        vertexShader: vertexShader,
        fragmentShader: dropFragmentShader,
      });

      this.normalMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            delta: { value: [1 / 256, 1 / 256] },  // TODO: Remove this useless uniform?
        },
        vertexShader: vertexShader,
        fragmentShader: normalFragmentShader,
      });

      this.updateMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            delta: { value: [1 / 256, 1 / 256] },  // TODO: Remove this useless uniform?
        },
        vertexShader: vertexShader,
        fragmentShader: updateFragmentShader,
      });
    });
  }

  addDrop(x, y, radius, strength) {

  }

  stepSimulation() {

  }

}

const water = new Water();

// Main Clock for simulation
// const clock = new THREE.Clock();


// Main rendering loop
function animate() {
  // const elapsedTime = clock.getDelta();

  renderer.render(scene, camera);

  controls.update();

  window.requestAnimationFrame(animate);
}

animate();
