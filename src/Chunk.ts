import { BoxBufferGeometry, BufferAttribute, BufferGeometry, Color, DoubleSide, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils";
import { createMarchingCubesGeometry } from "./MarchingCubes";
import { World } from "./World";
import { Terrain } from "./Terrain";

const EPSILON = 0.000001
const DEBUG = false;

export class Chunk {
  static terrainMaterial = new MeshStandardMaterial({ color: new Color('brown'), side: DoubleSide });
  static wireframeMaterial = new MeshStandardMaterial({ color: 0x000000, wireframe: true });
  
  
  resolution: number;
  terrain: any;
  mapValues: any[];
  chunkCoords: Vector3;

  constructor(chunkCoords) {
    this.chunkCoords = chunkCoords;

    this.resolution = 16;

    // this.mapValues3d = generate3dMapValues(this.resolution)

    this.mapValues = []
    
    for (let i = 0; i <= this.resolution; i++) {
        this.mapValues[i] = [];
        for (let j = 0; j <= this.resolution; j++) {
            this.mapValues[i][j] = [];
            for (let k = 0; k <= this.resolution; k++) {
              this.mapValues[i][j][k] = Terrain.instance.planet.getPoint(i / (this.resolution - 1) + chunkCoords.x, j / (this.resolution - 1)+ chunkCoords.y, k / (this.resolution - 1) + chunkCoords.z);
              // console.log(this.mapValues[i][j][k])
            }
        }
    }

    this.terrain = createMarchingCubesGeometry(this.mapValues, this.resolution);

    const geom = new BufferGeometry()
    geom.setAttribute("position", new BufferAttribute(new Float32Array(this.terrain), 3));
    geom.computeVertexNormals();

    const chunkMesh = new Mesh(geom, Chunk.terrainMaterial);
    chunkMesh.position.add(chunkCoords);
    World.instance.scene.add(chunkMesh);

    if(DEBUG) {
      const chunkBorderWireframe = new Mesh(new BoxBufferGeometry(1, 1, 1), Chunk.wireframeMaterial);
      chunkBorderWireframe.position.addScalar(0.5).add(chunkCoords);
      World.instance.scene.add(chunkBorderWireframe);
    }

    // const dataTexture = new DataTexture(this.mapValues3d, this.resolution, this.resolution)

    // dataTexture.format = RGBFormat;
    // dataTexture.type = UnsignedByteType;


    // World.instance.scene.add(new Mesh(new BoxBufferGeometry(2, 2, 2), new MeshStandardMaterial({ map: dataTexture })));
  }

  makeSphere(sideLength) {
    const pointsArray = new Float32Array(sideLength * sideLength * sideLength)
    let index = 0;
    const halfSideLength = sideLength * 0.5;
    for (let z = -halfSideLength; z < halfSideLength; z++) {
      for (let y = -halfSideLength; y < halfSideLength; y++) {
        for (let x = -halfSideLength; x < halfSideLength; x++) {
          const isOnUnitSphere = x * x + y * y + z * z > sideLength;
          this.terrain.field[index] += isOnUnitSphere ? 1 : 0;
        }
      }
    }
    return pointsArray;
  }

  makeBall(position: Vector3, radius: number) {

    position.set(clamp(position.x, 0, 1), clamp(position.y, 0, 1), clamp(position.z, 0, 1));

    let x, y, z, y_offset, z_offset, x_amount, y_amount, z_amount, z_amount2, y_amount2, val;

    for (z = 0; z < this.terrain.size; z++) {

      z_offset = this.terrain.size2 * z;
      z_amount = z / this.terrain.size - position.z;
      z_amount2 = z_amount * z_amount;

      for (y = 0; y < this.terrain.size; y++) {

        y_offset = z_offset + this.terrain.size * y;
        y_amount = y / this.terrain.size - position.y;
        y_amount2 = y_amount * y_amount;

        for (x = 0; x < this.terrain.size; x++) {

          x_amount = x / this.terrain.size - position.x;
          val = radius * this.terrain.size / (EPSILON + x_amount * x_amount + y_amount2 + z_amount2);

          this.terrain.field[y_offset + x] += val;

          // optimization
          // http://www.geisswerks.com/ryan/BLOBS/blobs.html
          // const ratio = Math.sqrt( ( x - xs ) * ( x - xs ) + ( y - ys ) * ( y - ys ) + ( z - zs ) * ( z - zs ) ) / radius;
          // const contrib = 1 - ratio * ratio * ratio * ( ratio * ( ratio * 6 - 15 ) + 10 );

          // this.terrain.palette[ ( y_offset + x ) * 3 + 0 ] += contrib;
          // this.terrain.palette[ ( y_offset + x ) * 3 + 1 ] += contrib;
          // this.terrain.palette[ ( y_offset + x ) * 3 + 2 ] += contrib;

        }

      }

    }
  }

  render(delta, time) { }
}

const generate3dMapValues = (sideLength: number): number[] => {
  const points = []
  for (let x = 0; x < sideLength; x++) {
    points[x] = [];
    for (let y = 0; y < sideLength; y++) {
      points[x][y] = [];
      for (let z = 0; z < sideLength; z++) {
        points[x][y][z] = z * z + y * y + x * x > 1 ? 1 : 0;
      }
    }
  }

  // let xoff = 0;
  // for (let i = 0; i < xSize; i++) {
  //     let yoff = 0;
  //     field[i] = [];
  //     for (let j = 0; j < ySize; j++) {
  //         let zoff = 0;
  //         field[i][j] = [];
  //         for (let k = 0; k < zSize; k++) {
  //             field[i][j][k] = noise.noise3D(xoff, yoff, zoff);
  //             zoff += increment;
  //         }
  //         yoff += increment;
  //     }
  //     xoff += increment;
  // }

  return points;
}