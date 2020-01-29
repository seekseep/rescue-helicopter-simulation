import ScheduleService from './ScheduleService'
import { PlaceTaskType, PlaceTask, ShelterScheduleCache, PlaceMission } from '../entities'

export default class ShelterScheduleService extends ScheduleService<
  PlaceTaskType,
  PlaceTask,
  PlaceMission,
  ShelterScheduleCache
> {
  updateCacheWithFinishedTask (finisedTask: PlaceTask, cachedAt: Date): void {
    super.updateCacheWithFinishedTask(finisedTask, cachedAt)

    switch (finisedTask.type) {
      case PlaceTaskType.RESCUE:
        this.schedule.cache.rescuedInjuredsCount += finisedTask.injuredsCount
        break
      default:
    }
  }

  updateCacheWithNewMission (newMission: PlaceMission, cachedAt): void {
    super.updateCacheWithNewMission(newMission, cachedAt)

    newMission.tasks.forEach(task => {
      switch (task.type) {
        case PlaceTaskType.RESCUE:
          this.schedule.cache.willRescuedInjuredsCount += task.injuredsCount
          break
        default:
      }
    })
  }

  get rescuedInjuredsCount (): number {
    return this.schedule.cache.rescuedInjuredsCount
  }

  get willRescuedInjuredsCount (): number {
    return this.schedule.cache.willRescuedInjuredsCount
  }
}
