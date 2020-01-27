import * as utils from '../utilities'
import * as builders from '../builders'
import config from '../config'
import { Transport, Place, TransportTask } from '../entities'

export default class TransportService {
  transport: Transport

  constructor (transport: Transport) {
    this.transport = transport
  }

  get speed (): number {
    return this.transport.speed
  }

  get useRescueRate (): boolean {
    return this.transport.useRescueRate
  }

  getMoveTimeMap (fromPlace: Place, toPlaces: Place[]): Map<number, Place[]> {
    const fromPosition = fromPlace.position

    const moveTimeMap = new Map<number, Place[]>()
    toPlaces.forEach(toPlace => {
      const time = utils.ceilTime(
        utils.moveTime(fromPosition, toPlace.position, this.speed)
      )
      moveTimeMap.set(
        time,
        [...(moveTimeMap.get(time) || []), toPlace]
      )
    })

    return moveTimeMap
  }

  getFastestArrivablePlaces (fromPlace: Place, toPlaces: Place[]): Place[] {
    const moveTimeMap = this.getMoveTimeMap(fromPlace, toPlaces)
    const minTime = Array.from(moveTimeMap.keys()).reduce((a, b) => Math.min(a, b))
    return moveTimeMap.get(minTime)
  }

  getLatestArrivablePlaces (fromPlace: Place, toPlaces: Place[]): Place[] {
    const moveTimeMap = this.getMoveTimeMap(fromPlace, toPlaces)
    const maxTime = Array.from(moveTimeMap.keys()).reduce((a, b) => Math.max(a, b))
    return moveTimeMap.get(maxTime)
  }

  buildMoveToPlaceTask (startedAt: Date, fromPlace: Place, toPlace: Place): TransportTask {
    const finishedAt = utils.addDateAndTime(
      startedAt,
      utils.ceilTime(
        utils.moveTime(fromPlace.position, toPlace.position, this.speed)
      )
    )
    return builders.tasks.transports.move(
      startedAt,
      finishedAt,
      fromPlace,
      toPlace
    )
  }

  buildRescueTask (startedAt: Date, rescuedIn: Place, injuredsCount: number): TransportTask {
    return builders.tasks.transports.rescue(
      startedAt,
      utils.addDateAndTime(startedAt, +config.get('TASK_DURATION_RESCUE')),
      rescuedIn,
      injuredsCount
    )
  }

  buildUnloadTask (startedAt: Date, unloadedIn: Place, injuredsCount: number): TransportTask {
    return builders.tasks.transports.unload(
      startedAt,
      utils.addDateAndTime(startedAt, +config.get('TASK_DURATION_UNLOAD')),
      unloadedIn,
      injuredsCount
    )
  }

  buildRefuelTask (startedAt: Date, refueledIn: Place): TransportTask {
    return builders.tasks.transports.refuel(
      startedAt,
      utils.addDateAndTime(startedAt, +config.get('TASK_DURATION_REFUEL')),
      refueledIn
    )
  }

  buildWaitTask (startedAt: Date, finishedAt: Date, waitedIn: Place): TransportTask {
    return builders.tasks.transports.wait(
      startedAt,
      finishedAt,
      waitedIn
    )
  }

  buildStayTask (startedAt: Date, finishedAt: Date, stayedIn: Place): TransportTask {
    return builders.tasks.transports.stay(
      startedAt,
      finishedAt,
      stayedIn
    )
  }
}
