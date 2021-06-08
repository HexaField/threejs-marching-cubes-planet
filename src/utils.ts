import { Vector3 } from "three";

export const roundNumberToPlaces = (number: number, places = 2) => {
  return (Math.pow(10, -places)) * Math.round(number * Math.pow(10, places))
}

export const round = (number: number) => {
  return Math.round(number)
}

export const roundOne = (number: number) => {
  return Math.round(number * 10) / 10
}

export const roundTwo = (number: number) => {
  return Math.round(number * 100) / 100
}

export const roundThree = (number: number) => {
  return Math.round(number * 1000) / 1000
}

const vec3 = new Vector3();
export const roundVectorToPlaces = (vector: { x: number, y: number, z: number }, places = 2) => {
  return vec3.set(roundNumberToPlaces(vector.x, places), roundNumberToPlaces(vector.y, places), roundNumberToPlaces(vector.z, places));
}