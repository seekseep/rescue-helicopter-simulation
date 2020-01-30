import ScheduleService from './ScheduleService'
import {
  PlaceTaskType,
  PlaceTask,
  PlaceMission,
  BaseScheduleCache
} from '../entities'

export default class BaseScheduleService extends ScheduleService<
  PlaceTaskType,
  PlaceTask,
  PlaceMission,
  BaseScheduleCache
> {
  get injuredsCount (): number {
    return this.schedule.cache.injuredsCount
  }

  updateCacheWithFinishedTask (finisedTask: PlaceTask): void {
    super.updateCacheWithFinishedTask(finisedTask)

    switch (finisedTask.type) {
      case PlaceTaskType.UNLOAD:
        this.schedule.cache.injuredsCount += finisedTask.injuredsCount
        break
      default:
    }
  }
}
