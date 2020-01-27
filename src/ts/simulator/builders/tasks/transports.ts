import { TransportTask, TransportTaskType, Place } from '../../entities'

export const rescue = (
  startedAt: Date,
  finishedAt: Date,
  recuedIn: Place,
  injuredsCount: number
): TransportTask => ({
  type: TransportTaskType.RESCUE,
  startedAt,
  startedIn: recuedIn,
  finishedAt,
  finishedIn: recuedIn,
  injuredsCount,
  isRefueled: false
})

export const unload = (
  startedAt: Date,
  finishedAt: Date,
  unloadedIn: Place,
  injuredsCount: number
): TransportTask => ({
  type: TransportTaskType.UNLOAD,
  startedAt,
  startedIn: unloadedIn,
  finishedAt,
  finishedIn: unloadedIn,
  injuredsCount,
  isRefueled: false
})

export const move = (
  startedAt: Date,
  finishedAt: Date,
  startedIn: Place,
  finishedIn: Place
): TransportTask => ({
  type: TransportTaskType.MOVE,
  startedAt,
  startedIn,
  finishedAt,
  finishedIn,
  injuredsCount: 0,
  isRefueled: false
})

export const wait = (
  startedAt: Date,
  finishedAt: Date,
  waitedIn: Place
): TransportTask => ({
  type: TransportTaskType.WAIT,
  startedAt,
  startedIn: waitedIn,
  finishedAt,
  finishedIn: waitedIn,
  injuredsCount: 0,
  isRefueled: false
})

export const refuel = (
  startedAt: Date,
  finishedAt: Date,
  refueledIn: Place
): TransportTask => ({
  type: TransportTaskType.REFUEL,
  startedAt,
  startedIn: refueledIn,
  finishedAt,
  finishedIn: refueledIn,
  injuredsCount: 0,
  isRefueled: true
})

export const stay = (
  startedAt: Date,
  finishedAt: Date,
  stayedIn: Place
): TransportTask => ({
  type: TransportTaskType.STAY,
  startedAt,
  finishedAt,
  startedIn: stayedIn,
  finishedIn: stayedIn,
  injuredsCount: 0,
  isRefueled: false
})
