import { PlaceTask, PlaceTaskType, Transport } from '../../entities'
import * as utils from '../../utilities'

export const rescue = (startedAt: Date, finishedAt: Date, transport: Transport, injuredsCount: number): PlaceTask => ({
  id: utils.getNewID(),
  type: PlaceTaskType.RESCUE,
  startedAt,
  finishedAt,
  transport,
  injuredsCount,
  duration: utils.diffDates(startedAt, finishedAt)
})

export const unload = (startedAt: Date, finishedAt: Date, transport: Transport, injuredsCount: number): PlaceTask => ({
  id: utils.getNewID(),
  type: PlaceTaskType.UNLOAD,
  startedAt,
  finishedAt,
  transport,
  injuredsCount,
  duration: utils.diffDates(startedAt, finishedAt)
})

export const refuel = (startedAt: Date, finishedAt: Date, transport: Transport): PlaceTask => ({
  id: utils.getNewID(),
  type: PlaceTaskType.REFUEL,
  startedAt,
  finishedAt,
  transport,
  injuredsCount: 0,
  duration: utils.diffDates(startedAt, finishedAt)
})

export const hold = (startedAt: Date, finishedAt: Date, transport: Transport): PlaceTask => ({
  id: utils.getNewID(),
  type: PlaceTaskType.HOLD,
  startedAt,
  finishedAt,
  transport,
  injuredsCount: 0,
  duration: utils.diffDates(startedAt, finishedAt)
})
