import { Scene, Color, DirectionalLight, AmbientLight, PerspectiveCamera, WebGLRenderer, Clock, Vector3, Mesh, BufferGeometry, MeshBasicMaterial, Object3D } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Terrain } from './terrain/Terrain';
import { createTransformControlBindings } from './createTransformControlBindings';
import { CHUNK_SCALE, PLANET_RADIUS } from './Constants';
import { DebugRenderer } from './DebugRenderer';
import { Body, BodyType, PhysXInstance } from 'three-physx';
import { CharacterController } from './CharacterController';
import { worldOrigin } from './worldOrigin';

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
  orbitControls: OrbitControls;
  transformControls: TransformControls;
  viewController: Mesh;
  terrain: Terrain;
  physicsDebugRenderer: DebugRenderer;
  character: CharacterController;
  physicsObjects: Object3D[] = [];
  constructor() {
    World.instance = this;
    this.update = this.update.bind(this);

    this.clock = new Clock();
    this.scene = new Scene();
    this.dirLight = new DirectionalLight('white', 0.8);
    this.ambientLight = new AmbientLight('white', 0.3);
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
    this.renderer = new WebGLRenderer();
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.terrain = new Terrain();

    this.scene.background = new Color('black');

    this.dirLight.position.set(-1, 1.75, 1);
    this.dirLight.position.multiplyScalar(30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);
    this.scene.add(this.ambientLight);

    this.camera.position.set(-2, 3, 7).multiplyScalar(CHUNK_SCALE);
    this.camera.lookAt(0, 0, 0);
    this.orbitControls.target = new Vector3()

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    // this.controls.screenSpacePanning = false;
    this.orbitControls.minDistance = 0.1;
    this.orbitControls.maxDistance = 500;

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.orbitControls.enabled = !event.value;
    });
    this.scene.add(this.transformControls);

    this.viewController = new Mesh(new BufferGeometry(), new MeshBasicMaterial());
    this.scene.add(this.viewController);
    // this.transformControls.attach(this.viewController);


    const origin = worldOrigin(1000)
    origin.visible = false;
    this.scene.add(origin)

    this.physicsDebugRenderer = new DebugRenderer(this.scene);

    this.terrain.onGeneration = () => {
      this.character = new CharacterController(new Vector3(0, PLANET_RADIUS * CHUNK_SCALE * 1.1, 0).add(new Vector3(Math.random(), Math.random(), Math.random())));
      this.scene.add(this.character.container);
      this.scene.remove(this.camera)
      this.orbitControls.reset()
      this.orbitControls.enabled = false
      this.orbitControls.dispose()
      this.camera.position.set(0, 0, 4)
      this.camera.lookAt(new Vector3(0, 0, 0))
      this.character.container.add(this.camera)
    }

    this.physicsDebugRenderer.setEnabled(false);

    document.addEventListener('keypress', (ev) => {
      if (ev.key === 'p') {
        this.physicsDebugRenderer.setEnabled(!this.physicsDebugRenderer.enabled);
        origin.visible = !origin.visible;
      }
    })

    container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize.bind(this));

    createTransformControlBindings();
  }

  onWindowResize() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

  }

  update() {
    const delta = this.clock.getDelta() * 1000;
    const time = this.clock.getElapsedTime();

    this.physicsObjects.forEach((obj: any) => {
      if (!obj.body) return;
      if ((obj.body as Body).type === BodyType.DYNAMIC) {
        const translation = (obj.body as Body).transform.translation;
        const rotation = (obj.body as Body).transform.rotation;
        obj.position.set(translation.x, translation.y, translation.z);
        obj.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
      } else if ((obj.body as Body).type === BodyType.CONTROLLER) {
        const translation = (obj.body as Body).transform.translation;
        obj.position.set(translation.x, translation.y, translation.z);
      }
    });

    this.terrain.update(delta, time);
    this.character?.update(delta, time);

    if(this.orbitControls.enabled) this.orbitControls.update();
    PhysXInstance.instance.update()
    this.physicsDebugRenderer.update()

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update);
  };

  addBody(obj, body) {
    obj.body = body;
    this.physicsObjects.push(obj);
    return PhysXInstance.instance.addBody(body)
  }

  addController(obj, body) {
    obj.body = body;
    this.physicsObjects.push(obj);
    return PhysXInstance.instance.createController(body)
  }

  addRaycastQuery(raycastQuery) {
    return PhysXInstance.instance.addRaycastQuery(raycastQuery)
  }

}