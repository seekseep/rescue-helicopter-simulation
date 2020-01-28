import ScheduleService from './ScheduleService'
import { PlaceTaskType, PlaceTask } from '../entities'

export default class ShelterScheduleService extends ScheduleService<PlaceTaskType, PlaceTask> {
  getRescuedInjuredsCount (date: Date): number {
    return this.getFinishedTasks(date).reduce((rescuedInjuredsCount, task) => {
      if (task.type !== PlaceTaskType.RESCUE) return rescuedInjuredsCount
      return rescuedInjuredsCount + task.injuredsCount
    }, 0)
  }

  getWillRescueInjuredsCount (): number {
    return this.tasks.reduce((count, task) => task.type === PlaceTaskType.RESCUE ? count + task.injuredsCount : count, 0)
  }
}
