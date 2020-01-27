import MissionService from './MissionService'
import { PlaceTask, PlaceTaskType } from '../entities'

export default class PlaceMissionService extends MissionService<PlaceTaskType, PlaceTask> {
  get isHoldMission (): boolean {
    return this.getTasksByTaskType(PlaceTaskType.HOLD).length === this.tasks.length
  }
}
