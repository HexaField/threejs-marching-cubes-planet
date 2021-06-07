import { CHUNK_EVENTS } from "./ChunkGeneratorEnums";
import { CHUNK_RESOLUTION } from "./Constants";
import { createMarchingCubesGeometry } from "./MarchingCubes";
import { MessageQueue, receiveWorker } from "./MessageQueue";
import { getPointOnPlanet } from "./Planet";

const resolution = CHUNK_RESOLUTION;

const generateChunk = ({ chunkCoords }) => {
  const mapValues = []

  for (let i = 0; i <= resolution; i++) {
    mapValues[i] = [];
    for (let j = 0; j <= resolution; j++) {
      mapValues[i][j] = [];
      for (let k = 0; k <= resolution; k++) {
        mapValues[i][j][k] = getPointOnPlanet(i / (resolution - 1) + chunkCoords.x, j / (resolution - 1) + chunkCoords.y, k / (resolution - 1) + chunkCoords.z);
      }
    }
  }
  return createMarchingCubesGeometry(mapValues, resolution);
}

receiveWorker((messageQueue: MessageQueue) => {
  messageQueue.addEventListener(CHUNK_EVENTS.REQUEST_GENERATE, ({ detail: { uuid, params } }) => {
    const vertices = generateChunk(params);
    messageQueue.sendEvent(CHUNK_EVENTS.RECEIVE_GENERATE, { vertices, uuid })
    messageQueue.sendQueue()
  })
})