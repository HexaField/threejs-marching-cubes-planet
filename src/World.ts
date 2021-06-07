import { Scene, Color, DirectionalLight, AmbientLight, PerspectiveCamera, WebGLRenderer, Clock, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Terrain } from './Terrain';
    
const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.right = '0';
container.style.bottom = '0';
document.body.appendChild(container);

export class World {

  static instance: World;
  clock: Clock;
  scene: Scene;
  dirLight: DirectionalLight;
  ambientLight: AmbientLight;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  terrain: Terrain;

  constructor() {
    World.instance = this;
    this.update = this.update.bind(this);

    this.clock = new Clock();
    this.scene = new Scene();
    this.dirLight = new DirectionalLight('white', 0.8);
    this.ambientLight  = new AmbientLight('white', 0.3);
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
    this.renderer = new WebGLRenderer();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.terrain = new Terrain();

    this.scene.background = new Color('black');

    this.dirLight.position.set(-1, 1.75, 1);
    this.dirLight.position.multiplyScalar(30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);
    this.scene.add(this.ambientLight);

    this.camera.position.set(-2, 3, 7);
    this.camera.lookAt(0, 0, 0);
    this.controls.target = new Vector3()

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    // this.controls.screenSpacePanning = false;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 500;
    container.appendChild(this.renderer.domElement);
    window.addEventListener( 'resize', this.onWindowResize.bind(this) );

    // this.scene.add(new Mesh(new SphereBufferGeometry(), new MeshStandardMaterial()))

  }

  onWindowResize () {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

  }

  update () {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.terrain.update(delta, time);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update);
  };

}