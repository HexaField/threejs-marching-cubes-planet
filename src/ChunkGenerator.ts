import { CHUNK_EVENTS } from "./ChunkGeneratorEnums";
import { CHUNK_RESOLUTION } from "./Constants";
import { createMarchingCubesGeometry } from "./MarchingCubes";
import { MessageQueue, receiveWorker } from "./MessageQueue";
import { getPointOnPlanet } from "./Planet";

const generateChunk = ({ chunkCoords }) => {
  let time = Date.now()
  const mapValues = []
  for (let i = 0; i <= CHUNK_RESOLUTION; i++) {
    mapValues[i] = [];
    for (let j = 0; j <= CHUNK_RESOLUTION; j++) {
      mapValues[i][j] = [];
      for (let k = 0; k <= CHUNK_RESOLUTION; k++) {
        mapValues[i][j][k] = getPointOnPlanet(
          i / (CHUNK_RESOLUTION - 1) + chunkCoords.x, 
          j / (CHUNK_RESOLUTION - 1) + chunkCoords.y, 
          k / (CHUNK_RESOLUTION - 1) + chunkCoords.z
        );
      }
    }
  }
  const noiseTime = Date.now() - time
  time = Date.now()
  const data = createMarchingCubesGeometry(mapValues, CHUNK_RESOLUTION);
  // console.log('noise', noiseTime, 'cubes', Date.now() - time)
  return data;
}

receiveWorker((messageQueue: MessageQueue) => {
  messageQueue.addEventListener(CHUNK_EVENTS.REQUEST_GENERATE, ({ detail: { uuid, params } }) => {
    const vertices = generateChunk(params);
    messageQueue.sendEvent(uuid, { vertices })
    messageQueue.sendQueue()
  })
})