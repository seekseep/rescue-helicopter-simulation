import MissionsService from './MissionsService'
import { TransportTaskType, TransportTask } from '../entities'
import { TransportMissionService } from '.'

export default class TransportMissionsService extends MissionsService<TransportTaskType, TransportTask> {
  getRescuedInjuredsCount (date: Date): number {
    const finishedMissions = this.getFinishedMissions(date)
    return finishedMissions.reduce((count, mission) => count + new TransportMissionService(mission).rescuedInjuredsCount, 0)
  }
}
