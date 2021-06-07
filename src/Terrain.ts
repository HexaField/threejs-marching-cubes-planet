import { Color, Mesh, MeshStandardMaterial, SphereBufferGeometry, Vector3 } from "three";
import { Chunk } from "./Chunk";
import { createWorker, MessageQueue } from "./MessageQueue";
import { World } from "./World";
// @ts-ignore
import ChunkGeneratorWorker from './ChunkGenerator?worker';
import { CHUNK_COUNT, PLANET_RADIUS } from "./Constants";
import { CHUNK_EVENTS } from "./ChunkGeneratorEnums";
import { generateUUID } from "three/src/math/MathUtils";

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
  worker: MessageQueue;
  async initialise() {
    this.worker = await createWorker(new ChunkGeneratorWorker, 3);
  }
  async generateChunk(chunkCoords: Vector3) {
    return new Promise<number[]>((resolve) => {
      const request_uuid = generateUUID();
      this.worker.addEventListener(CHUNK_EVENTS.RECEIVE_GENERATE, (ev: { detail: { uuid, vertices } }) => {
        if(ev.detail.uuid === request_uuid) {
          resolve(ev.detail.vertices);
        }
      })
      this.worker.sendEvent(CHUNK_EVENTS.REQUEST_GENERATE, { uuid: request_uuid, params: { chunkCoords } })
      this.worker.sendQueue()
    });
  }
}

export class Terrain {
  static instance: Terrain;
  chunks: ChunkDictionary;
  water: Mesh;
  chunkGenerator: ChunkGenerator;

  constructor() {
    Terrain.instance = this;

    this.chunks = new ChunkDictionary();
    this.water = new Mesh(new SphereBufferGeometry(PLANET_RADIUS, 16, 16), new MeshStandardMaterial({ color: new Color('aqua'), opacity: 0.5, transparent: true }))
    World.instance.scene.add(this.water);
    this.generateChunks();
  }

  async generateChunks() {

    this.chunkGenerator = new ChunkGenerator();
    await this.chunkGenerator.initialise();

    const halfSideLength = CHUNK_COUNT * 0.5;
    for (let z = -halfSideLength; z < halfSideLength; z++) {
      for (let y = -halfSideLength; y < halfSideLength; y++) {
        for (let x = -halfSideLength; x < halfSideLength; x++) {
          const pos = new Vector3(x, y, z);
          this.chunks.set(pos, new Chunk(pos));
        }
      }
    }
  }

  update(delta, time) { 
    // this.chunks.forEach((chunk) => {
    //   chunk.update(delta, time)
    // })
  }
}