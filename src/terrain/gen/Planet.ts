import { Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils";
import { PLANET_RADIUS, NOISE_SCALE, NOISE_HEIGHT_MULTIPLIER, NOISE_LAYERS } from "../../Constants";

import { makeNoise3D } from "open-simplex-noise";
const seed = 357890;
const noise = makeNoise3D(seed);

// import { makeNoise3D } from "fast-simplex-noise";
// const noise = makeNoise3D();

// import SimplexNoise from "simplex-noise";
// const noise = new SimplexNoise();

const vec3 = new Vector3();

export const getPointOnPlanet = (x: number, y: number, z: number) => {
  const distFromCenter = vec3.set(x, y, z).length();
  let value = distFromCenter - PLANET_RADIUS;
  let noiseVal = 0;
  let freq = NOISE_SCALE;
  let amplitude = NOISE_HEIGHT_MULTIPLIER;
  for (let layer = 0; layer < NOISE_LAYERS; layer++) {
    noiseVal += noise(x * freq, y * freq, z * freq) * amplitude;
    amplitude *= 0.6;
    freq *= 0.6;
  }
  noiseVal += 0.2;
  return -clamp(value + noiseVal, -1, 1);
}