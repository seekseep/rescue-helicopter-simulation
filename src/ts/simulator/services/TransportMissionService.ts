import MissionService from './MissionService'
import { TransportTask, TransportTaskType, Place } from '../entities'

export default class TransportMissionService extends MissionService<TransportTaskType, TransportTask> {

  get flightTime() : number {
    let time = 0
    this.moveTasks.forEach(task => time += task.duration)
    this.waitTasks.forEach(task => time += task.duration)
    return time
  }

  get rescuePlace (): Place {
    return this.rescueTasks[0].finishedIn
  }

  get refuelTasks (): TransportTask[] {
    return this.getTasksByTaskType(TransportTaskType.REFUEL)
  }

  get moveTasks (): TransportTask[] {
    return this.getTasksByTaskType(TransportTaskType.MOVE)
  }

  get rescueTasks (): TransportTask[] {
    return this.getTasksByTaskType(TransportTaskType.RESCUE)
  }

  get unloadTasks (): TransportTask[] {
    return this.getTasksByTaskType(TransportTaskType.UNLOAD)
  }

  get waitTasks (): TransportTask[] {
    return this.getTasksByTaskType(TransportTaskType.WAIT)
  }

  get stayTasks (): TransportTask[] {
    return this.getTasksByTaskType(TransportTaskType.STAY)
  }

  get rescuedInjuredsCount (): number {
    return this.rescueTasks.reduce((count, task) => count + task.injuredsCount, 0)
  }
}
