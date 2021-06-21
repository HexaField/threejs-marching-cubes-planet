import { Vector3 } from 'three';
import { PhysXInstance } from 'three-physx';
import { World } from "./World";

PhysXInstance.instance.initPhysX(new Worker(new URL('./worker.ts', import.meta.url), { type: "module" }), {
  verbose: true,
  gravity: new Vector3()
}).then(() => {  
  const world = new World();
  requestAnimationFrame(world.update);
})