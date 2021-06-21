import { BoxBufferGeometry, BufferAttribute, BufferGeometry, Color, DoubleSide, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { CHUNK_SCALE } from "../Constants";
import { Terrain } from "./Terrain";
import { World } from "../World";
import { Body, BodyType, PhysXInstance, Shape, SHAPES } from "three-physx";

export class Chunk {
  static terrainMaterial = new MeshStandardMaterial({ color: new Color('brown'), side: DoubleSide });
  static wireframeMaterial = new MeshStandardMaterial({ color: new Color('white'), wireframe: true });

  vertices: any;
  mapValues: any[];
  chunkCoords: Vector3;
  terrainBody: Body;

  constructor(chunkCoords) {
    this.chunkCoords = chunkCoords;

    const chunkBorderWireframe = new Mesh(new BoxBufferGeometry(1, 1, 1), Chunk.wireframeMaterial);
    chunkBorderWireframe.position.addScalar(0.5).add(chunkCoords).multiplyScalar(CHUNK_SCALE);
    chunkBorderWireframe.scale.multiplyScalar(CHUNK_SCALE);
    chunkBorderWireframe.visible = false;
    World.instance.scene.add(chunkBorderWireframe);

    document.addEventListener('keypress', (ev) => {
      if (ev.key === 'o') {
        chunkBorderWireframe.visible = !chunkBorderWireframe.visible;
      }
    })
  }

  async create() {

    const vertices: number[] = await Terrain.instance.chunkGenerator.generateChunk(this.chunkCoords)

    if(vertices.length === 0) return;

    const geom = new BufferGeometry()
    geom.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
    geom.computeVertexNormals();

    const chunkMesh = new Mesh(geom, Chunk.terrainMaterial);
    chunkMesh.position.add(this.chunkCoords).multiplyScalar(CHUNK_SCALE);
    chunkMesh.scale.multiplyScalar(CHUNK_SCALE);
    World.instance.scene.add(chunkMesh);

    const indices = Object.keys(vertices).map(Number);
    const shape = {
      shape: SHAPES.TriangleMesh,
      transform: { scale: chunkMesh.scale },
      options: { vertices, indices },
      config: {
        collisionLayer: 1 << 1,
        collisionMask: 1 << 1
      }
    };

    this.terrainBody = new Body({
      shapes: [shape],
      type: BodyType.STATIC,
      transform: {
        translation: chunkMesh.position,
      },
    });

    PhysXInstance.instance.addBody(this.terrainBody);
  }
  update(delta, time) { }
}