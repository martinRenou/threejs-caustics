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
    this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 1);

    this._geometry = new THREE.PlaneBufferGeometry();

    this._textureA = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this._textureB = new THREE.WebGLRenderTarget(256, 256, {type: THREE.FloatType});
    this.texture = this._textureA;

    const shadersPromises = [
      loadFile('shaders/water_vertexshader.glsl'),
      loadFile('shaders/water_drop_fragmentshader.glsl'),
      loadFile('shaders/water_normal_fragmentshader.glsl'),
      loadFile('shaders/water_update_fragmentshader.glsl'),
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
      this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
      this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
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

    mesh.material.uniforms['texture'].value = oldTexture.texture;

    renderer.setRenderTarget(newTexture);

    // TODO Camera is useless here, what should be done?
    renderer.render(mesh, this._camera);

    this.texture = newTexture;
  }

}

const water = new Water();

// Main Clock for simulation
// const clock = new THREE.Clock();


// Main rendering loop
function animate() {
  // const elapsedTime = clock.getDelta();

  water.stepSimulation(renderer);

  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  controls.update();

  window.requestAnimationFrame(animate);
}

water.loaded.then(() => {
  for (var i = 0; i < 20; i++) {
    water.addDrop(
      renderer,
      Math.random() * 2 - 1, Math.random() * 2 - 1,
      0.03, (i & 1) ? 0.01 : -0.01
    );
  }

  animate();
});
