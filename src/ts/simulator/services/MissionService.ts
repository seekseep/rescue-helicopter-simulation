import { Mission, Task } from '../entities'
import TasksService from './TasksService'

export default class MissionService<TT, T extends Task<TT>> {
  mission: Mission<TT, T>
  constructor (mission: Mission<TT, T>) {
    this.mission = mission
  }

  getTasksByTaskType (taskType: TT): T[] {
    return this.tasks.filter(task => task.type === taskType)
  }

  get tasks (): T[] {
    return this.mission.tasks
  }

  get startedAt (): Date {
    return new Date(this.tasks.map(task => task.startedAt.getTime()).reduce((a, b) => Math.min(a, b)))
  }

  get finishedAt (): Date {
    return new Date(this.tasks.map(task => task.finishedAt.getTime()).reduce((a, b) => Math.max(a, b)))
  }

  get firstTask (): T {
    return this.tasks[0]
  }

  get lastTask (): T {
    return this.tasks[this.tasks.length - 1]
  }

  get time (): number {
    return this.finishedAt.getTime() - this.startedAt.getTime()
  }

  clone (): Mission<TT, T> {
    const { agentID, displayName, tasks } = this.mission
    return {
      agentID,
      displayName,
      tasks: new TasksService(tasks).clone()
    }
  }
}
