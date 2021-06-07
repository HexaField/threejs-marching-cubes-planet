import { Color, Mesh, MeshStandardMaterial, SphereBufferGeometry, Vector3 } from "three";
import { Chunk } from "./Chunk";
import { Planet } from "./Planet";
import { World } from "./World";

export class ChunkDictionary {
  chunks: Map<string, Chunk> = new Map<string, Chunk>()
  set(coords: Vector3, chunk: Chunk) {
    this.chunks.set(`${coords.x} ${coords.y} ${coords.z}`, chunk);
  }
  get(coords: Vector3) {
    return this.chunks.get(`${coords.x} ${coords.y} ${coords.z}`);
  }
}

export class Terrain {
  static instance: Terrain;
  chunks: ChunkDictionary;
  chunksCount: number;
  planet: Planet;
  water: Mesh;

  constructor() {
    Terrain.instance = this;

    this.chunks = new ChunkDictionary();
    this.chunksCount = 8;
    this.planet = new Planet(3);
    this.water = new Mesh(new SphereBufferGeometry(this.planet.radius), new MeshStandardMaterial({ color: new Color('aqua'), opacity: 0.5, transparent: true }))
    World.instance.scene.add(this.water);

    const now = Date.now()
    this.generateChunks();
    console.log(Date.now() - now)
  }

  generateChunks() {
    const halfSideLength = this.chunksCount * 0.5;
    for (let z = -halfSideLength; z < halfSideLength; z++) {
      for (let y = -halfSideLength; y < halfSideLength; y++) {
        for (let x = -halfSideLength; x < halfSideLength; x++) {
          const pos = new Vector3(x, y, z);
          this.chunks.set(pos, new Chunk(pos));
        }
      }
    }
  }

  render(delta, time) { 
    // this.chunks.forEach((chunk) => {
    //   chunk.render(delta, time)
    // })
  }
}