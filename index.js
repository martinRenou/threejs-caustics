const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;

// Colors
const black = new THREE.Color('black');

// Shader chunks
loadFile('shaders/utils.glsl').then((utils) => {
  THREE.ShaderChunk['utils'] = utils;
});

// Create Scene and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');
const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
camera.position.set(1, 1, 1);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
renderer.setSize(width, height);

// Light direction
const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

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

// Textures
const cubetextureloader = new THREE.CubeTextureLoader();

const textureCube = cubetextureloader.load([
  'xpos.jpg', 'xneg.jpg',
  'ypos.jpg', 'ypos.jpg',
  'zpos.jpg', 'zneg.jpg',
]);

const textureloader = new THREE.TextureLoader();

const tiles = textureloader.load('tiles.jpg');

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


class WaterSimulation {

  constructor() {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

    this._geometry = new THREE.PlaneBufferGeometry(2, 2);

    this._textureA = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this._textureB = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this.texture = this._textureA;

    const shadersPromises = [
      loadFile('shaders/simulation/water_vertex.glsl'),
      loadFile('shaders/simulation/water_drop_fragment.glsl'),
      loadFile('shaders/simulation/water_normal_fragment.glsl'),
      loadFile('shaders/simulation/water_update_fragment.glsl'),
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, dropFragmentShader, normalFragmentShader, updateFragmentShader]) => {
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

      const normalMaterial = new THREE.RawShaderMaterial({
        uniforms: {
            delta: { value: [1 / 256, 1 / 256] },  // TODO: Remove this useless uniform and hardcode it in shaders?
            texture: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: normalFragmentShader,
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
      this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
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

  updateNormals(renderer) {
    this._render(renderer, this._normalMesh);
  }

  _render(renderer, mesh) {
    // Swap textures
    const oldTexture = this.texture;
    const newTexture = this.texture === this._textureA ? this._textureB : this._textureA;

    mesh.material.uniforms['texture'].value = oldTexture.texture;

    renderer.setRenderTarget(newTexture);

    // TODO Camera is useless here, what should be done?
    renderer.render(mesh, this._camera);

    this.texture = newTexture;
  }

}


class Caustics {

  constructor(lightFrontGeometry) {
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

    this._geometry = lightFrontGeometry;

    this.texture = new THREE.WebGLRenderTarget(1024, 1024, {type: THREE.UNSIGNED_BYTE});

    const shadersPromises = [
      loadFile('shaders/caustics/caustics_vertex.glsl'),
      loadFile('shaders/caustics/caustics_fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      const material = new THREE.RawShaderMaterial({
        uniforms: {
            light: { value: light },
            water: { value: null },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });

      this._causticMesh = new THREE.Mesh(this._geometry, material);
    });
  }

  update(renderer, waterTexture) {
    this._causticMesh.material.uniforms['water'].value = waterTexture;

    renderer.setRenderTarget(this.texture);
    renderer.setClearColor(black, 0);
    renderer.clear();

    // TODO Camera is useless here, what should be done?
    renderer.render(this._causticMesh, this._camera);
  }

}


class Water {

  constructor() {
    this.geometry = new THREE.PlaneBufferGeometry(2, 2, 200, 200);

    const shadersPromises = [
      loadFile('shaders/water/water_vertex.glsl'),
      loadFile('shaders/water/water_fragment.glsl')
    ];

    this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
      this.material = new THREE.ShaderMaterial({
        uniforms: {
            light: { value: light },
            tiles: { value: tiles },
            sky: { value: textureCube },
            water: { value: null },
            causticTex: { value: null },
            underwater: { value: false },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });

      this.mesh = new THREE.Mesh(this.geometry, this.material);
    });
  }

  draw(renderer, waterTexture, causticsTexture) {
    this.material.uniforms['water'].value = waterTexture;
    this.material.uniforms['causticTex'].value = causticsTexture;

    this.material.side = THREE.FrontSide;
    this.material.uniforms['underwater'].value = false;
    renderer.render(this.mesh, camera);

    this.material.side = THREE.BackSide;
    this.material.uniforms['underwater'].value = true;
    renderer.render(this.mesh, camera);
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

    renderer.setRenderTarget(null);
    renderer.render(this._mesh, this._camera);
  }

}

const waterSimulation = new WaterSimulation();
const water = new Water();
const caustics = new Caustics(water.geometry);

const debug = new Debug();

// Main Clock for simulation
// const clock = new THREE.Clock();


// Main rendering loop
function animate() {
  // const elapsedTime = clock.getDelta();

  waterSimulation.stepSimulation(renderer);
  waterSimulation.stepSimulation(renderer);
  waterSimulation.updateNormals(renderer);

  caustics.update(renderer, waterSimulation.texture.texture);

  // debug.draw(renderer, caustics.texture.texture);

  renderer.setRenderTarget(null);
  renderer.setClearColor(black, 1);
  renderer.clear();

  water.draw(renderer, waterSimulation.texture.texture, caustics.texture.texture);

  controls.update();

  window.requestAnimationFrame(animate);
}

Promise.all([waterSimulation.loaded, caustics.loaded, water.loaded, debug.loaded]).then(() => {
  for (var i = 0; i < 20; i++) {
    waterSimulation.addDrop(
      renderer,
      Math.random() * 2 - 1, Math.random() * 2 - 1,
      0.03, (i & 1) ? 0.02 : -0.02
    );
  }

  animate();
});
