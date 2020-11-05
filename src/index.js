let camera;
let renderer;
let scene;
const target = new THREE.Vector3();

let lon = 90,
  lat = 0;
let phi = 0,
  theta = 0;
let pointerX, pointerY;
init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');

  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000,
  );
  // camera.position.z = 1000;
  camera.layers.enable(1);

  const textures = getTexturesFromAtlasFile(
    '../asset/sun_temple_stripe_stereo.jpg',
    12,
  );

  const materials = [];

  for (let i = 0; i < 6; i++) {
    materials.push(new THREE.MeshBasicMaterial({ map: textures[i] }));
  }

  const geometry = new THREE.BoxBufferGeometry(100, 100, 100);
  geometry.scale(1, 1, -1);

  const mesh = new THREE.Mesh(geometry, materials);

  const materialsR = [];

  for (let i = 6; i < 12; i++) {
    materialsR.push(new THREE.MeshBasicMaterial({ map: textures[i] }));
  }

  const meshR = new THREE.Mesh(geometry, materialsR);
  meshR.layers.set(2);
  scene.add(mesh);
  scene.add(meshR);

  document.body.addEventListener('mousedown', onPointerDown, false);
  document.body.addEventListener('touchstart', onTouchstart, false);
  document.addEventListener('wheel', onDocumentMouseWheel, false);
  pointerX = window.innerWidth / 2;
  pointerY = window.innerHeight / 2;

  window.addEventListener('resize', onWindowResize, false);

  lat = Math.max(-85, Math.min(85, lat));
  phi = THREE.MathUtils.degToRad(90 - lat);
  theta = THREE.MathUtils.degToRad(lon);
}

function onTouchstart(event) {
  const { clientX, clientY } = event.touches[0];
  pointerX = clientX;
  pointerY = clientY;
  document.addEventListener('touchmove', onTouchmove, false);
  document.addEventListener('touchend', onTouchend, false);
}
function onTouchend(event) {
  camera.updateProjectionMatrix();
  document.removeEventListener('touchmove', onTouchmove, false);
  document.removeEventListener('touchend', onTouchend, false);
}

function onTouchmove(event) {
  updateTarget(event.touches[0]);
}

function onPointerDown(event) {
  // if (event.isPrimary === false) return;

  pointerX = event.clientX;
  pointerY = event.clientY;

  document.addEventListener('mousemove', onPointerMove, false);
  document.addEventListener('mouseup', onPointerUp, false);
}
function onPointerUp(event) {
  if (event.isPrimary === false) return;

  camera.updateProjectionMatrix();
  document.removeEventListener('mousemove', onPointerMove);
  document.removeEventListener('mouseup', onPointerUp);
}

function onPointerMove(event) {
  // if (event.isPrimary === false) return;
  updateTarget(event);
}

/**
 *
 * @param {{
 *  clientX:number,
 *  clientY:number
 * }} axis
 */
function updateTarget(axis) {
  const { clientX, clientY } = axis;
  lon -= (clientX - pointerX) * 0.1;
  lat += (clientY - pointerY) * 0.1;

  lat = Math.max(-85, Math.min(85, lat));
  phi = THREE.MathUtils.degToRad(90 - lat);
  theta = THREE.MathUtils.degToRad(lon);

  pointerX = clientX;
  pointerY = clientY;
}

function onDocumentMouseWheel(event) {
  const fov = camera.fov + event.deltaY * 0.05;

  camera.fov = THREE.MathUtils.clamp(fov, 10, 75);

  camera.updateProjectionMatrix();
}
function getTexturesFromAtlasFile(atlasImgUrl, tilesNum) {
  const textures = [];

  for (let i = 0; i < tilesNum; i++) {
    textures[i] = new THREE.Texture();
  }

  const loader = new THREE.ImageLoader();
  loader.load(atlasImgUrl, function (imageObj) {
    let canvas, context;
    const tileWidth = imageObj.height;

    for (let i = 0; i < textures.length; i++) {
      canvas = document.createElement('canvas');
      context = canvas.getContext('2d');
      canvas.height = tileWidth;
      canvas.width = tileWidth;
      context.drawImage(
        imageObj,
        tileWidth * i,
        0,
        tileWidth,
        tileWidth,
        0,
        0,
        tileWidth,
        tileWidth,
      );
      textures[i].image = canvas;
      textures[i].needsUpdate = true;
    }
  });

  return textures;
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  target.x = Math.sin(phi) * Math.cos(theta);
  target.y = Math.cos(phi);
  target.z = Math.sin(phi) * Math.sin(theta);
  camera.lookAt(target);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
