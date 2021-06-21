/* eslint-disable @typescript-eslint/no-var-requires */
import { receiveWorker } from 'three-physx'
import PHYSX from '../lib/physx.release.esm.js'
PHYSX().then(receiveWorker)