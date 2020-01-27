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
  GeneralTask
} from '../entities'
import { TaskService, MissionService } from '../services'

export default class PlaceAgent extends Agent<PlaceTaskType, PlaceTask> {
  place: Place

  constructor (id: AgentID, place: Place, schedule: PlaceSchedule, environment: Environment) {
    super(id, schedule, environment)
    this.place = place
  }

  action (): void {
    // do nothing
  }

  get placeID (): PlaceID {
    return this.place.id
  }

  get position (): Position {
    return this.place.position
  }

  get displayName (): string {
    return this.place.displayName
  }

  getFreeTasks (fromDate: Date): GeneralTask[] {
    return this.scheduleService.getFreeTasks(this.place.maxLandableCount, fromDate)
  }

  getLandableAt (arrivedAt: Date, stayingTime: number): Date {
    const freeTasks = this.getFreeTasks(arrivedAt)
    if (freeTasks.length < 1) return arrivedAt

    const freeTask = freeTasks.find(freeTask => new TaskService(freeTask).duration >= stayingTime)
    if (freeTask) return freeTask.startedAt

    const lastMission = this.missions[this.missions.length - 1]
    if (lastMission) return new MissionService(lastMission).finishedAt

    return arrivedAt
  }

  clone (environment?: Environment): PlaceAgent {
    return new PlaceAgent(
      this.id,
      this.place,
      this.scheduleService.clone(),
      environment || this.environment
    )
  }
}
