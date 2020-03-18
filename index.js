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

// Light direction
const light = [0., 0., -1.];

// Create Renderer
const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
// camera.position.set(0, -1, 1);
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1);
camera.position.set(-2 * light[0], -2 * light[1], -2 * light[2]);
camera.lookAt(0, 0, 0);
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


class WaterSimulation {

  constructor() {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

    this._geometry = new THREE.PlaneBufferGeometry(2, 2);

    this._textureA = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this._textureB = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this.texture = this._textureA;

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
    const oldTexture = this.texture;
    const newTexture = this.texture === this._textureA ? this._textureB : this._textureA;

    const target = renderer.getRenderTarget();

    renderer.setRenderTarget(newTexture);

    mesh.material.uniforms['texture'].value = oldTexture.texture;

    // TODO Camera is useless here, what should be done?
    renderer.render(mesh, this._camera);

    renderer.setRenderTarget(target);

    this.texture = newTexture;
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
    });
  }

  setTexture(waterTexture) {
    this.material.uniforms['water'].value = waterTexture;
  }

}


// This class renders the water normal for each fragment visible
// from the light point of view. If the water is not visible from
// the light point of view, for example because hidden by another
// mesh like the pool.
class NormalMapper {

  constructor() {
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1);
    camera.position.set(-2 * light[0], -2 * light[1], -2 * light[2]);
    camera.lookAt(0, 0, 0);

    this._target = new THREE.WebGLRenderTarget(1024, 1024, {type: THREE.FloatType});

    const shadersPromises = [
      loadFile('shaders/water/vertex.glsl'),
      loadFile('shaders/normal/water_fragment.glsl'),
      loadFile('shaders/normal/environment_fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, waterFragmentShader, environmentFragmentShader]) => {
      this._waterMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: waterFragmentShader,
      });
      this._waterMaterial.extensions = {
        derivatives: true
      };

      this._poolMaterial = new THREE.ShaderMaterial({
        fragmentShader: environmentFragmentShader,
      });
      this._poolMaterial.side = THREE.BackSide;

      this._waterMesh = new THREE.Mesh(waterGeometry, this._waterMaterial);
      this._poolShader = new THREE.Mesh(poolGeometry, this._poolMaterial);
    });
  }

  render(renderer) {
    const target = renderer.getRenderTarget();

    renderer.setRenderTarget(null);
    renderer.setClearColor(black, 0);
    renderer.clear();

    // TODO Use a different layer for the Normal Mapper?
    renderer.render(this.mesh, this._camera);

    renderer.setRenderTarget(target);
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
    });
  }

  draw(renderer, texture) {
    this._material.uniforms['texture'].value = texture;

    const target = renderer.getRenderTarget();

    renderer.setRenderTarget(null);
    renderer.render(this._mesh, this._camera);

    renderer.setRenderTarget(target);
  }

}

const waterSimulation = new WaterSimulation();
const water = new Water();
const normal = new NormalMapper();

const debug = new Debug();


// Main rendering loop
function animate() {
  waterSimulation.stepSimulation(renderer);

  const waterTexture = waterSimulation.texture.texture;

  // normal.render(renderer);

  // const normalTexture = normal._target.texture;

  // debug.draw(renderer, normalTexture);

  // renderer.setClearColor(white, 1);
  // renderer.clear();

  water.setTexture(waterTexture);

  renderer.render(scene, camera);

  controls.update();

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

const loaded = [waterSimulation.loaded, water.loaded, debug.loaded, normal.loaded];

Promise.all(loaded).then(() => {
  scene.add(water.mesh);

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
