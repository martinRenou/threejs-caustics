const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.domElement);

const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;

// Colors
const black = new THREE.Color('black');
const white = new THREE.Color('white');

function loadFile(filename) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FileLoader();

    loader.load(filename, (data) => {
      resolve(data);
    });
  });
}

// Constants
const light = [0., 0., -1.];
const waterPosition = new THREE.Vector3(0, 0, 0.5);
const near = 0.;
const far = 5.;

// Create Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
camera.position.set(0, -1, 1);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setSize(width, height);
renderer.autoClear = false;

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

// Ray caster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const targetgeometry = new THREE.PlaneGeometry(2, 2);
for (let vertex of targetgeometry.vertices) {
  vertex.z = waterPosition.z;
}
const targetmesh = new THREE.Mesh(targetgeometry);

// Textures
const cubetextureloader = new THREE.CubeTextureLoader();

const textureCube = cubetextureloader.load([
  'xpos.jpg', 'xneg.jpg',
  'ypos.jpg', 'ypos.jpg',
  'zpos.jpg', 'zneg.jpg',
]);

const textureloader = new THREE.TextureLoader();

const tiles = textureloader.load('tiles.jpg');

// Geometries
const waterGeometry = new THREE.PlaneBufferGeometry(2, 2, 256, 256);
const poolGeometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1, -1, -1,
  -1, -1, 1,
  -1, 1, -1,
  -1, 1, 1,
  1, -1, -1,
  1, 1, -1,
  1, -1, 1,
  1, 1, 1,
  -1, -1, -1,
  1, -1, -1,
  -1, -1, 1,
  1, -1, 1,
  -1, 1, -1,
  -1, 1, 1,
  1, 1, -1,
  1, 1, 1,
  -1, -1, -1,
  -1, 1, -1,
  1, -1, -1,
  1, 1, -1,
  -1, -1, 1,
  1, -1, 1,
  -1, 1, 1,
  1, 1, 1
]);
const indices = new Uint32Array([
  0, 1, 2,
  2, 1, 3,
  4, 5, 6,
  6, 5, 7,
  12, 13, 14,
  14, 13, 15,
  16, 17, 18,
  18, 17, 19,
  20, 21, 22,
  22, 21, 23
]);

poolGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
poolGeometry.setIndex(new THREE.BufferAttribute(indices, 1));

// Environment
const floorGeometry = new THREE.PlaneBufferGeometry(4, 4, 1, 1);

const sphereGeometry = new THREE.SphereBufferGeometry(0.2, 32, 32);
sphereGeometry.translate(0.5, 0.5, 1.);
const sphereMesh = new THREE.Mesh(sphereGeometry, new THREE.MeshStandardMaterial({color: 'white'}));

const vtkLoader = new THREE.VTKLoader();
let bunny;
const bunnyLoaded = new Promise((resolve) => {
  vtkLoader.load('bunny.vtk', (bunnyGeometry) => {
    bunnyGeometry.center();
    bunnyGeometry.computeVertexNormals();
    bunnyGeometry.scale(4, 4, 4);

    bunny = new THREE.Mesh(bunnyGeometry, new THREE.MeshStandardMaterial({color: 'white'}));
    resolve();
  });
});

class WaterSimulation {

  constructor() {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

    this._geometry = new THREE.PlaneBufferGeometry(2, 2);

    this._targetA = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this._targetB = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this.target = this._targetA;

    const shadersPromises = [
      loadFile('shaders/simulation/vertex.glsl'),
      loadFile('shaders/simulation/drop_fragment.glsl'),
      loadFile('shaders/simulation/update_fragment.glsl'),
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, dropFragmentShader, updateFragmentShader]) => {
      const dropMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            center: { value: [0, 0] },
            radius: { value: 0 },
            strength: { value: 0 },
            texture: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: dropFragmentShader,
      });

      const updateMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            delta: { value: [1 / 256, 1 / 256] },  // TODO: Remove this useless uniform and hardcode it in shaders?
            texture: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: updateFragmentShader,
      });

      this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial);
      this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
    });
  }

  // Add a drop of water at the (x, y) coordinate (in the range [-1, 1])
  addDrop(renderer, x, y, radius, strength) {
    this._dropMesh.material.uniforms['center'].value = [x, y];
    this._dropMesh.material.uniforms['radius'].value = radius;
    this._dropMesh.material.uniforms['strength'].value = strength;

    this._render(renderer, this._dropMesh);
  }

  stepSimulation(renderer) {
    this._render(renderer, this._updateMesh);
  }

  _render(renderer, mesh) {
    // Swap textures
    const _oldTarget = this.target;
    const _newTarget = this.target === this._targetA ? this._targetB : this._targetA;

    const oldTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(_newTarget);

    mesh.material.uniforms['texture'].value = _oldTarget.texture;

    // TODO Camera is useless here, what should be done?
    renderer.render(mesh, this._camera);

    renderer.setRenderTarget(oldTarget);

    this.target = _newTarget;
  }

}


class Water {

  constructor() {
    this.geometry = waterGeometry;

    const shadersPromises = [
      loadFile('shaders/water/vertex.glsl'),
      loadFile('shaders/water/fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      this.material = new THREE.ShaderMaterial({
        uniforms: {
            light: { value: light },
            water: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });
      this.material.side = THREE.DoubleSide;
      this.material.extensions = {
        derivatives: true
      };

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.position.set(waterPosition.x, waterPosition.y, waterPosition.z);
    });
  }

  setTexture(waterTexture) {
    this.material.uniforms['water'].value = waterTexture;
  }

}


// This renders the environment map seen from the light POV.
// The resulting texture contains (posx, posy, posz, depth) in the colors channels.
class Env {

  constructor() {
    this._camera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, near, far);
    this._camera.position.set(-2 * light[0], -2 * light[1], -2 * light[2]);
    this._camera.lookAt(0, 0, 0);

    this.target = new THREE.WebGLRenderTarget(1024, 1024, {type: THREE.FloatType});

    const shadersPromises = [
      loadFile('shaders/env/vertex.glsl'),
      loadFile('shaders/env/fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      this._material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });
    });
  }

  render(renderer, geometries) {
    const oldTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(this.target);
    renderer.setClearColor(black, 0);
    renderer.clear();

    for (let geometry of geometries) {
      renderer.render(new THREE.Mesh(geometry, this._material), this._camera);
    }

    renderer.setRenderTarget(oldTarget);
  }

}


class Caustics {

  constructor() {
    this._camera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, near, far);
    this._camera.position.set(-2 * light[0], -2 * light[1], -2 * light[2]);
    this._camera.lookAt(0, 0, 0);

    this.target = new THREE.WebGLRenderTarget(1024, 1024, {type: THREE.FloatType});

    this._waterGeometry = new THREE.PlaneBufferGeometry(2, 2, 216, 216);

    const shadersPromises = [
      loadFile('shaders/caustics/water_vertex.glsl'),
      loadFile('shaders/caustics/water_fragment.glsl'),
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([waterVertexShader, waterFragmentShader]) => {
      this._waterMaterial = new THREE.ShaderMaterial({
        uniforms: {
          light: { value: light },
          env: { value: null },
          water: { value: null },
        },
        vertexShader: waterVertexShader,
        fragmentShader: waterFragmentShader,
      });
      this._waterMaterial.side = THREE.DoubleSide;
      this._waterMaterial.extensions = {
        derivatives: true
      };

      this._waterMesh = new THREE.Mesh(this._waterGeometry, this._waterMaterial);
    });
  }

  setTextures(waterTexture, envTexture) {
    this._waterMaterial.uniforms['env'].value = envTexture;
    this._waterMaterial.uniforms['water'].value = waterTexture;
  }

  render(renderer) {
    const oldTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(this.target);
    renderer.setClearColor(black, 0);
    renderer.clear();

    renderer.render(this._waterMesh, this._camera);

    renderer.setRenderTarget(oldTarget);
  }

}


class Floor {

  constructor() {
    const shadersPromises = [
      loadFile('shaders/floor/vertex.glsl'),
      loadFile('shaders/floor/fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      this._material = new THREE.ShaderMaterial({
        uniforms: {
            tiles: { value: tiles },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });
      this._material.extensions = {
        derivatives: true
      };

      this.mesh = new THREE.Mesh(floorGeometry, this._material);
    });
  }

}


class Debug {

  constructor() {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 1);
    this._geometry = new THREE.PlaneBufferGeometry();

    const shadersPromises = [
      loadFile('shaders/debug/vertex.glsl'),
      loadFile('shaders/debug/fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      this._material = new THREE.RawShaderMaterial({
        uniforms: {
            texture: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });

      this._mesh = new THREE.Mesh(this._geometry, this._material);
      this._material.transparent = true;
    });
  }

  draw(renderer, texture) {
    this._material.uniforms['texture'].value = texture;

    const oldTarget = renderer.getRenderTarget();

    renderer.setRenderTarget(null);
    renderer.render(this._mesh, this._camera);

    renderer.setRenderTarget(oldTarget);
  }

}

const waterSimulation = new WaterSimulation();

const water = new Water();
const floor = new Floor();

const env = new Env();
const caustics = new Caustics();

const debug = new Debug();


// Main rendering loop
function animate() {
  stats.begin();

  waterSimulation.stepSimulation(renderer);

  const waterTexture = waterSimulation.target.texture;

  water.setTexture(waterTexture);

  env.render(renderer, [floorGeometry, bunny.geometry, sphereGeometry]);
  const envTexture = env.target.texture;

  caustics.setTextures(waterTexture, envTexture);
  caustics.render(renderer);
  const causticsTexture = caustics.target.texture;

  // debug.draw(renderer, envTexture);
  debug.draw(renderer, causticsTexture);

  // renderer.setRenderTarget(null);
  // renderer.setClearColor(white, 1);
  // renderer.clear();

  // renderer.render(scene, camera);

  // controls.update();

  stats.end();

  window.requestAnimationFrame(animate);
}

function onMouseMove(event) {
  const rect = canvas.getBoundingClientRect();

  mouse.x = (event.clientX - rect.left) * 2 / width - 1;
  mouse.y = - (event.clientY - rect.top) * 2 / height + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(targetmesh);

  for (let intersect of intersects) {
    waterSimulation.addDrop(renderer, intersect.point.x, intersect.point.y, 0.03, 0.04);
  }
}

const loaded = [
  waterSimulation.loaded,
  water.loaded, floor.loaded,
  env.loaded,
  caustics.loaded,
  debug.loaded,
  bunnyLoaded
];

Promise.all(loaded).then(() => {
  scene.add(water.mesh);
  scene.add(floor.mesh);
  scene.add(sphereMesh);
  scene.add(bunny);

  canvas.addEventListener('mousemove', { handleEvent: onMouseMove });

  for (var i = 0; i < 20; i++) {
    waterSimulation.addDrop(
      renderer,
      Math.random() * 2 - 1, Math.random() * 2 - 1,
      0.03, (i & 1) ? 0.02 : -0.02
    );
  }

  animate();
});
