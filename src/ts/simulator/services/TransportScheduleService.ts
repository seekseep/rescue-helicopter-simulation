import ScheduleService from './ScheduleService'

import { TransportTask, TransportTaskType, TransportSchedule, TransportScheduleCache, TransportMission } from '../entities'

export default class TransportScheduleService extends ScheduleService<TransportTaskType, TransportTask, TransportMission, TransportScheduleCache> {
  schedule: TransportSchedule

  updateCacheWithFinishedTask (finisedTask: PlaceTask): void {
    super.updateCacheWithFinishedTask(finisedTask)

    switch (finisedTask.type) {
      case TransportTaskType.RESCUE:
        this.schedule.cache.rescuedInjuredsCount += finisedTask.injuredsCount
        break
      default:
    }
  }
}
