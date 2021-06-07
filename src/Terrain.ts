import { BoxBufferGeometry, Color, DoubleSide, Mesh, MeshBasicMaterial, MeshPhongMaterial, Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils";
import { MarchingCubes } from './MarchingCubes';
import { World } from "./World";

const EPSILON = 0.000001

export class Terrain {
  terrain: any;
  resolution: number;

  constructor() {

    const now = Date.now()
    World.instance.scene.remove(this.terrain);

    this.resolution = 64;

    this.terrain = new MarchingCubes(this.resolution, new MeshPhongMaterial({ color: 0xff0000, side: DoubleSide }), true, true);
    // all x,y,z vals between 0 and 1
    this.makeSphere(new Vector3().setScalar(0.5), 0.25);

    this.terrain.enableUvs = false;
    this.terrain.enableColors = false;

    World.instance.scene.add(this.terrain);

    // World.instance.scene.add(new Mesh(this.terrain.generateBufferGeometry(), new MeshBasicMaterial({ color: 0x000000, wireframe: true }) ));

    World.instance.scene.add(new Mesh(new BoxBufferGeometry(2, 2, 2), new MeshBasicMaterial({ color: 0x000000, wireframe: true })));
    console.log(Date.now() - now)
  }

  makeSphere(position: Vector3, radius: number) {

    position.set(clamp(position.x, 0, 1), clamp(position.y, 0, 1), clamp(position.z, 0, 1));

    let x, y, z, y_offset, z_offset, x_amount, y_amount, z_amount, z_amount2, y_amount2, val;

    for ( z = 0; z < this.terrain.size; z ++ ) {

      z_offset = this.terrain.size2 * z;
      z_amount = z / this.terrain.size - position.z;
      z_amount2 = z_amount * z_amount;

      for ( y = 0; y < this.terrain.size; y ++ ) {

        y_offset = z_offset + this.terrain.size * y;
        y_amount = y / this.terrain.size - position.y;
        y_amount2 = y_amount * y_amount;

        for ( x = 0; x < this.terrain.size; x ++ ) {

          x_amount = x / this.terrain.size - position.x;
          val = radius * this.terrain.size / ( EPSILON + x_amount * x_amount + y_amount2 + z_amount2 );

            this.terrain.field[ y_offset + x ] += val;

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