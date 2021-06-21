import { Group, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { Controller, PhysXInstance, RaycastQuery, SceneQueryType } from "three-physx";
import { CapsuleBufferGeometry } from "./CapsuleBufferGeometry";
import { World } from "./World";

const keys = {};

export class CharacterController {
  container: Group;
  controller: Controller;
  capsuleMesh: Mesh;
  raycastQuery: RaycastQuery

  constructor(startingPos: Vector3) {

    this.container = new Group();
    this.container.position.copy(startingPos);
    const capsuleTall = new CapsuleBufferGeometry(0.5, 0.5, 1);
    const capsuleSmall = new CapsuleBufferGeometry(0.5, 0.5, 0.2);
    capsuleSmall.translate(0, -0.4, 0)

    this.capsuleMesh = new Mesh(capsuleTall, new MeshBasicMaterial({ color: 0xffffff }));
    this.container.add(this.capsuleMesh);
    this.controller = World.instance.addController(this.container, new Controller({
      isCapsule: true,
      radius: 0.5,
      position: startingPos,
      collisionLayer: 1 << 1,
      collisionMask: 1 << 1
    }));
    console.log(this.controller)

    document.addEventListener('keydown', (ev) => {
      keys[ev.code] = true;
      if (ev.code === 'ShiftLeft') {
        this.controller.resize(0.2);
        this.capsuleMesh.geometry = capsuleSmall;
      }
    });
    document.addEventListener('keyup', (ev) => {
      delete keys[ev.code];
      if (ev.code === 'ShiftLeft') {
        this.controller.resize(1);
        this.capsuleMesh.geometry = capsuleTall;
      }
      if (ev.code === 'KeyR') {
        this.controller.updateTransform({ translation: startingPos })
      }
    });

    this.raycastQuery = World.instance.addRaycastQuery(new RaycastQuery({
      type: SceneQueryType.Closest,
      origin: new Vector3(0, this.controller.height, 0),
      direction: new Vector3(0, -1, 0),
      maxDistance: 0.5 + (this.controller.height * 0.5) + this.controller.radius,
      collisionMask: 1 << 1,
    }));
  }

  update(delta: number, time: number) {
    if(!this.controller) return;

    this.raycastQuery.origin.copy(this.controller.transform.translation);
    const closestHit = this.raycastQuery.hits[0];
    const isGrounded = closestHit ? true : this.controller.collisions.down;

    if (isGrounded) {
      if (this.controller.velocity.y < 0)
      this.controller.velocity.y = 0;
      // console.log('grounded')
    } else {
      this.controller.velocity.y -= (0.2 / delta);
    }
    Object.entries(keys).forEach(([key]) => {
      if (key === 'KeyW') {
        this.controller.delta.z -= 0.1;
      }
      if (key === 'KeyS') {
        this.controller.delta.z += 0.1;
      }
      if (key === 'KeyA') {
        this.controller.delta.x -= 0.1;
      }
      if (key === 'KeyD') {
        this.controller.delta.x += 0.1;
      }
      if (key === 'Space' && this.controller.collisions.down) {
        this.controller.velocity.y = 0.2;
      }
    })
    this.controller.delta.y += this.controller.velocity.y;
  }
}