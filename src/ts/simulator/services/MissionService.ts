import { Mission, Task } from '../entities'

export default class MissionService<TT, T extends Task<TT>> {
  mission: Mission<TT, T>
  taskTypeToTasks: Map<TT, T[]>

  constructor (mission: Mission<TT, T>) {
    this.mission = mission
    this.taskTypeToTasks = new Map()
    this.mission.tasks.forEach(task => {
      const tasks = this.taskTypeToTasks.get(task.type) || []
      tasks.push(task)
      this.taskTypeToTasks.set(task.type, tasks)
    })
  }

  get tasks (): T[] {
    return this.mission.tasks
  }

  getTasksByTaskType (taskType: TT): T[] {
    return this.taskTypeToTasks.get(taskType) || []
  }
}
