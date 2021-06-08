import { CHUNK_EVENTS } from "./ChunkGeneratorEnums";
import { CHUNK_RESOLUTION } from "./Constants";
import { createMarchingCubesGeometry } from "./MarchingCubes";
import { MessageQueue, receiveWorker } from "./MessageQueue";
import { getPointOnPlanet } from "./Planet";
import { round } from "./utils";


let runs = 0, noiseTimeAcc = 0, cubesTimeAcc = 0;
const generateChunk = ({ chunkCoords }) => {
  runs++
  let time = Date.now()
  const mapValues = []
  const chunnkRes1 = CHUNK_RESOLUTION - 1
  for (let i = 0; i <= CHUNK_RESOLUTION; i++) {
    mapValues[i] = [];
    const i_scaled = i / chunnkRes1 + chunkCoords.x
    for (let j = 0; j <= CHUNK_RESOLUTION; j++) {
      mapValues[i][j] = [];
      const j_scaled = j / chunnkRes1 + chunkCoords.y
      for (let k = 0; k <= CHUNK_RESOLUTION; k++) {
        mapValues[i][j][k] = getPointOnPlanet(
          i_scaled, 
          j_scaled,
          k / chunnkRes1 + chunkCoords.z
        );
      }
    }
  }
  const noiseTime = Date.now() - time
  noiseTimeAcc += noiseTime
  time = Date.now()
  const data = createMarchingCubesGeometry(mapValues, CHUNK_RESOLUTION);
  cubesTimeAcc += Date.now() - time
  console.log('noise', round(noiseTimeAcc / runs), 'cubes', round(cubesTimeAcc / runs), 'total', round((noiseTimeAcc + cubesTimeAcc) / runs))
  return data;
}

receiveWorker((messageQueue: MessageQueue) => {
  messageQueue.addEventListener(CHUNK_EVENTS.REQUEST_GENERATE, ({ detail: { uuid, params } }) => {
    const vertices = generateChunk(params);
    messageQueue.sendEvent(uuid, { vertices })
    messageQueue.sendQueue()
  })
})