import { PlaceTask, PlaceTaskType, Transport } from '../../entities'

export const rescue = (startedAt: Date, finishedAt: Date, transport: Transport, injuredsCount: number): PlaceTask => ({
  type: PlaceTaskType.RESCUE,
  startedAt,
  finishedAt,
  transport,
  injuredsCount
})

export const unload = (startedAt: Date, finishedAt: Date, transport: Transport, injuredsCount: number): PlaceTask => ({
  type: PlaceTaskType.UNLOAD,
  startedAt,
  finishedAt,
  transport,
  injuredsCount
})

export const refuel = (startedAt: Date, finishedAt: Date, transport: Transport): PlaceTask => ({
  type: PlaceTaskType.REFUEL,
  startedAt,
  finishedAt,
  transport,
  injuredsCount: 0
})

export const hold = (startedAt: Date, finishedAt: Date, transport: Transport): PlaceTask => ({
  type: PlaceTaskType.HOLD,
  startedAt,
  finishedAt,
  transport,
  injuredsCount: 0
})
