import _ from 'lodash'

import Agent from './Agent'
import Environment from '../Environment'
import {
  AgentID,
  Place,
  PlaceID,
  PlaceTask,
  PlaceTaskType,
  Position,
  PlaceSchedule,
  GeneralTask,
  PlaceScheduleCache,
  PlaceMission
} from '../entities'
import * as utils from '../utilities'

export default class PlaceAgent extends Agent<PlaceTaskType, PlaceTask, PlaceMission, PlaceScheduleCache> {
  place: Place

  constructor (
    id: AgentID,
    place: Place,
    schedule: PlaceSchedule,
    environment: Environment
  ) {
    super(id, schedule, environment)
    this.place = place
  }

  get placeID (): PlaceID {
    return this.place.id
  }

  get displayName (): string {
    return this.place.displayName
  }

  get position (): Position {
    return this.place.position
  }

  getFreeTasks (fromDate: Date): GeneralTask[] {
    return this.scheduleService.freeTasks.reduce((tasks: GeneralTask[], task: GeneralTask) => {
      if (task.finishedAt < fromDate) return tasks

      if (task.startedAt < fromDate) {
        return [...tasks, {
          ...task,
          startedAt: fromDate
        }]
      }

      return [...tasks, task]
    }, [])
  }

  getLandableAt (arrivedAt: Date, stayingTime: number): Date {
    const freeTasks = this.scheduleService.freeTasks
    if (freeTasks.length > 0) {
      const freeTask = freeTasks.find(freeTask =>
        utils.diffDates(arrivedAt, freeTask.finishedAt) >= stayingTime
      )
      if (freeTask) {
        return (arrivedAt < freeTask.startedAt) ? freeTask.startedAt : arrivedAt
      }
    }

    const lastMission = this.scheduleService.lastMission
    if (lastMission && arrivedAt < lastMission.finishedAt ) {
      return lastMission.finishedAt
    }

    return arrivedAt
  }
}
