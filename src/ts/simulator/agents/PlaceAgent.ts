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
    const freeTasks = this.getFreeTasks(arrivedAt)
    if (freeTasks.length < 1) return arrivedAt

    const freeTask = freeTasks.find(freeTask => freeTask.duration >= stayingTime)
    if (freeTask) return freeTask.startedAt

    const lastMission = this.missions[this.missions.length - 1]
    if (lastMission) return lastMission.finishedAt

    return arrivedAt
  }

  clone (environment?: Environment): PlaceAgent {
    return new PlaceAgent(
      this.id,
      this.place,
      _.cloneDeep(this.schedule),
      environment || this.environment
    )
  }
}
