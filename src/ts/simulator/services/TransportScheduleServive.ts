import ScheduleService from './ScheduleService'
import TaskService from './TaskService'
import { TransportTask, TransportTaskType } from '../entities'

export default class TransportScheduleService extends ScheduleService<TransportTaskType, TransportTask> {
  get lastRefuelTask (): TransportTask {
    return this.tasks[
      this.getLastTaskIndex(TransportTaskType.REFUEL)
    ]
  }

  get lastContinuousFlightTime (): number {
    const afterRefueldTasks = this.tasks.slice(
      this.getLastTaskIndex(TransportTaskType.REFUEL) + 1
    )

    const flightTime = afterRefueldTasks.filter(task => (
      task.type === TransportTaskType.MOVE ||
      task.type === TransportTaskType.WAIT
    )).reduce((time: number, task: TransportTask) => {
      return time + new TaskService(task).duration
    }, 0)

    return flightTime
  }
}
