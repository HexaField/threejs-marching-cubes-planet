import { BoxBufferGeometry, BufferAttribute, BufferGeometry, Color, DoubleSide, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { Terrain } from "./Terrain";
import { World } from "./World";

export class Chunk {
  static terrainMaterial = new MeshStandardMaterial({ color: new Color('brown'), side: DoubleSide });
  static wireframeMaterial = new MeshStandardMaterial({ color: new Color('white'), wireframe: true });

  vertices: any;
  mapValues: any[];
  chunkCoords: Vector3;

  constructor(chunkCoords) {
    this.chunkCoords = chunkCoords;

    const chunkBorderWireframe = new Mesh(new BoxBufferGeometry(1, 1, 1), Chunk.wireframeMaterial);
    chunkBorderWireframe.position.addScalar(0.5).add(chunkCoords);
    chunkBorderWireframe.visible = false;
    World.instance.scene.add(chunkBorderWireframe);

    document.addEventListener('keypress', (ev) => {
      if (ev.key === 'o') {
        chunkBorderWireframe.visible = !chunkBorderWireframe.visible;
      }
    })

    Terrain.instance.chunkGenerator.generateChunk(this.chunkCoords).then((vertices: number[]) => {

      const geom = new BufferGeometry()
      geom.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
      geom.computeVertexNormals();

      const chunkMesh = new Mesh(geom, Chunk.terrainMaterial);
      chunkMesh.position.add(chunkCoords);
      World.instance.scene.add(chunkMesh);
    });
  }
  update(delta, time) { }
}