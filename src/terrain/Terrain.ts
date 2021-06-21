import { Color, Mesh, MeshStandardMaterial, SphereBufferGeometry, Vector3 } from "three";
import { Chunk } from "./Chunk";
import { createWorker, MessageQueue } from "../MessageQueue";
import { World } from "../World";
// @ts-ignore
import ChunkGeneratorWorker from './gen/ChunkGenerator?worker';
import { CHUNK_COUNT, CHUNK_COUNT_TOTAL, CHUNK_SCALE, PLANET_RADIUS } from "../Constants";
import { CHUNK_EVENTS } from "./gen/ChunkGeneratorEnums";
import { generateUUID } from "three/src/math/MathUtils";
import { Body, BodyType, PhysXInstance, SHAPES } from "three-physx";

export class ChunkDictionary {
  chunks: Map<string, Chunk> = new Map<string, Chunk>()
  set(coords: Vector3, chunk: Chunk) {
    this.chunks.set(`${coords.x} ${coords.y} ${coords.z}`, chunk);
  }
  get(coords: Vector3) {
    return this.chunks.get(`${coords.x} ${coords.y} ${coords.z}`);
  }
}

export class ChunkGenerator {
  workers: MessageQueue[];
  async initialise() {
    this.workers = await Promise.all([
      createWorker(new ChunkGeneratorWorker),
      createWorker(new ChunkGeneratorWorker),
      createWorker(new ChunkGeneratorWorker),
      createWorker(new ChunkGeneratorWorker),
    ]);
    this.workers.forEach((worker, i) => {
      worker.id = i;
    })
  }
  getWorker(): MessageQueue {
    return this.workers.reduce((prevWorker, worker) => {
      return prevWorker.activeTasks <= worker.activeTasks ? prevWorker : worker;
    })
  }
  async generateChunk(chunkCoords: Vector3) {
    const worker = this.getWorker();
    return new Promise<number[]>((resolve) => {
      const request_uuid = generateUUID();
      worker.addEventListener(request_uuid, (ev: { detail: { vertices } }) => {
        worker.activeTasks--;
        resolve(ev.detail.vertices);
      })
      worker.sendEvent(CHUNK_EVENTS.REQUEST_GENERATE, { uuid: request_uuid, params: { chunkCoords } })
      worker.sendQueue()
      worker.activeTasks++;
    });
  }
}

export class Terrain {
  static instance: Terrain;
  chunks: ChunkDictionary;
  water: Mesh;
  waterBody: Body;
  chunkGenerator: ChunkGenerator;
  onGeneration: () => void;

  constructor() {
    Terrain.instance = this;

    this.chunks = new ChunkDictionary();
    this.water = new Mesh(new SphereBufferGeometry(PLANET_RADIUS, 16, 16), new MeshStandardMaterial({ color: new Color('aqua'), opacity: 0.5, transparent: true }))
    World.instance.scene.add(this.water);
    this.water.scale.multiplyScalar(CHUNK_SCALE);

    const shape = {
      shape: SHAPES.Sphere,
      transform: { scale: new  Vector3(1, 1, 1) },
      options: { radius: PLANET_RADIUS },
      config: {
        collisionLayer: 1 << 1,
        collisionMask: 1 << 1
      }
    };

    this.waterBody = new Body({
      shapes: [shape],
      type: BodyType.STATIC,
      transform: {
        translation: this.water.position,
        scale: this.water.scale,
      },

    });

    PhysXInstance.instance.addBody(this.waterBody);
    
    this.generateChunks();
  }

  async generateChunks() {

    this.chunkGenerator = new ChunkGenerator();
    await this.chunkGenerator.initialise();

    new Promise<void>((resolve) => {

      let completed = 0;

      const halfSideLength = CHUNK_COUNT * 0.5;
      for (let z = -halfSideLength; z < halfSideLength; z++) {
        for (let y = -halfSideLength; y < halfSideLength; y++) {
          for (let x = -halfSideLength; x < halfSideLength; x++) {
            const pos = new Vector3(x, y, z);
            const newChunk = new Chunk(pos)
            this.chunks.set(pos, newChunk);
            newChunk.create().then(() => {
              completed ++;
              if(completed >= CHUNK_COUNT_TOTAL) resolve()
            })
          }
        }
      }
    }).then(() => {
      this.onGeneration()
    })
  }

  update(delta, time) { 
    // this.chunks.forEach((chunk) => {
    //   chunk.update(delta, time)
    // })
  }
}