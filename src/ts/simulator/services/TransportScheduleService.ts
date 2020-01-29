import ScheduleService from './ScheduleService'

import { TransportTask, TransportTaskType, TransportSchedule, TransportScheduleCache, TransportMission } from '../entities'

export default class TransportScheduleService extends ScheduleService<TransportTaskType, TransportTask, TransportMission, TransportScheduleCache> {
  schedule: TransportSchedule
}
