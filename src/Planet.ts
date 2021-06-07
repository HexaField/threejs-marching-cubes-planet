import { makeNoise3D } from "open-simplex-noise";
import { Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils";
const noise = makeNoise3D(Date.now());

const vec3 = new Vector3();

const noiseScale = 2;
const noiseHeightMultiplier = 0.7;
const noiseLayers = 8;

export class Planet {

  radius: number;
  constructor(radius: number) {
    this.radius = radius;
  }

  getPoint(x: number, y: number, z: number) {
    const distFromCenter = vec3.set(x, y, z).length();
    let value = distFromCenter - this.radius;
    let noiseVal = 0;
    let freq = noiseScale;
    let amplitude = noiseHeightMultiplier;
    for (let layer = 0; layer < noiseLayers; layer++) {
      noiseVal += noise(x * freq, y * freq, z * freq) * amplitude;
      amplitude *= 0.6;
      freq *= 0.6;
    }
    noiseVal += 0.25;
    return -clamp(value + noiseVal, -1, 1);
  }
}