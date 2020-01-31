import { TransportTask, TransportTaskType, Place } from '../../entities'
import * as utils from '../../utilities'

export const rescue = (
  startedAt: Date,
  finishedAt: Date,
  recuedIn: Place,
  injuredsCount: number
): TransportTask => ({
  id: utils.getNewID(),
  type: TransportTaskType.RESCUE,
  startedAt,
  startedIn: recuedIn,
  finishedAt,
  finishedIn: recuedIn,
  injuredsCount,
  isRefueled: false,
  duration: utils.diffDates(startedAt, finishedAt)
})

export const unload = (
  startedAt: Date,
  finishedAt: Date,
  unloadedIn: Place,
  injuredsCount: number
): TransportTask => ({
  id: utils.getNewID(),
  type: TransportTaskType.UNLOAD,
  startedAt,
  startedIn: unloadedIn,
  finishedAt,
  finishedIn: unloadedIn,
  injuredsCount,
  isRefueled: false,
  duration: utils.diffDates(startedAt, finishedAt)
})

export const move = (
  startedAt: Date,
  finishedAt: Date,
  startedIn: Place,
  finishedIn: Place
): TransportTask => ({
  id: utils.getNewID(),
  type: TransportTaskType.MOVE,
  startedAt,
  startedIn,
  finishedAt,
  finishedIn,
  injuredsCount: 0,
  isRefueled: false,
  duration: utils.diffDates(startedAt, finishedAt)
})

export const wait = (
  startedAt: Date,
  finishedAt: Date,
  waitedIn: Place
): TransportTask => ({
  id: utils.getNewID(),
  type: TransportTaskType.WAIT,
  startedAt,
  startedIn: waitedIn,
  finishedAt,
  finishedIn: waitedIn,
  injuredsCount: 0,
  isRefueled: false,
  duration: utils.diffDates(startedAt, finishedAt)
})

export const refuel = (
  startedAt: Date,
  finishedAt: Date,
  refueledIn: Place
): TransportTask => ({
  id: utils.getNewID(),
  type: TransportTaskType.REFUEL,
  startedAt,
  startedIn: refueledIn,
  finishedAt,
  finishedIn: refueledIn,
  injuredsCount: 0,
  isRefueled: true,
  duration: utils.diffDates(startedAt, finishedAt)
})

export const stay = (
  startedAt: Date,
  finishedAt: Date,
  stayedIn: Place
): TransportTask => ({
  id: utils.getNewID(),
  type: TransportTaskType.STAY,
  startedAt,
  finishedAt,
  startedIn: stayedIn,
  finishedIn: stayedIn,
  injuredsCount: 0,
  isRefueled: false,
  duration: utils.diffDates(startedAt, finishedAt)
})
