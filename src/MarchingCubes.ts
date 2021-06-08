//adapted from https://github.com/KineticTactic/marching-cubes-js/blob/master/sketch.js

import triangulationTable from './MarchingCubesTables'

export const createMarchingCubesGeometry = (field: number[], sideLength: number) => {
  const res = 1;
  let vertices: number[] = [];
  let sideLength1 = sideLength - 1;
  for (let i = 0; i < sideLength1; i++) {
    let x = i * res;
    for (let j = 0; j < sideLength1; j++) {
      let y = j * res;
      for (let k = 0; k < sideLength1; k++) {
        let z = k * res;

        let values = [
          field[i][j][k] + 1,
          field[i + 1][j][k] + 1,
          field[i + 1][j][k + 1] + 1,
          field[i][j][k + 1] + 1,
          field[i][j + 1][k] + 1,
          field[i + 1][j + 1][k] + 1,
          field[i + 1][j + 1][k + 1] + 1,
          field[i][j + 1][k + 1] + 1,
        ];

        let edges = [
            lerp(x, x + res, (1 - values[0]) / (values[1] - values[0])),
            y,
            z,

            x + res,
            y,
            lerp(z, z + res, (1 - values[1]) / (values[2] - values[1])),

            lerp(x, x + res, (1 - values[3]) / (values[2] - values[3])),
            y,
            z + res,
            
            x,
            y,
            lerp(z, z + res, (1 - values[0]) / (values[3] - values[0])),

            lerp(x, x + res, (1 - values[4]) / (values[5] - values[4])),
            y + res,
            z,

            x + res,
            y + res,
            lerp(z, z + res, (1 - values[5]) / (values[6] - values[5])),

            lerp(x, x + res, (1 - values[7]) / (values[6] - values[7])),
            y + res,
            z + res,

            x,
            y + res,
            lerp(z, z + res, (1 - values[4]) / (values[7] - values[4])),

            x,
            lerp(y, y + res, (1 - values[0]) / (values[4] - values[0])),
            z,

            x + res,
            lerp(y, y + res, (1 - values[1]) / (values[5] - values[1])),
            z,

            x + res,
            lerp(y, y + res, (1 - values[2]) / (values[6] - values[2])),
            z + res,

            x,
            lerp(y, y + res, (1 - values[3]) / (values[7] - values[3])),
            z + res
        ];

        let state = getState(
          Math.ceil(field[i][j][k]),
          Math.ceil(field[i + 1][j][k]),
          Math.ceil(field[i + 1][j][k + 1]),
          Math.ceil(field[i][j][k + 1]),
          Math.ceil(field[i][j + 1][k]),
          Math.ceil(field[i + 1][j + 1][k]),
          Math.ceil(field[i + 1][j + 1][k + 1]),
          Math.ceil(field[i][j + 1][k + 1])
        );
        // if(isNaN(state)) {
        //   // console.warn('state is NaN', state);
        //   continue;
        // }
        if(state > 255 || state < 0) { 
          // console.warn('state is invalid', state);
          continue;
        }
        for (let edgeIndex of triangulationTable[state]) {
          if (edgeIndex !== -1) {
            vertices.push(edges[edgeIndex * 3] / sideLength1, edges[edgeIndex * 3 + 1] / sideLength1, edges[edgeIndex * 3 + 2] / sideLength1);
          }
        }
      }
    }
  }
  return vertices;
}


function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function getState(a, b, c, d, e, f, g, h) {
  return a * 1 + b * 2 + c * 4 + d * 8 + e * 16 + f * 32 + g * 64 + h * 128;
}