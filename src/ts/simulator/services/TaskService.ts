import { Task } from '../entities/tasks'

export default class TaskService<TT, T extends Task<TT>> {
  task: T
  constructor (task: T) {
    this.task = task
  }

  get duration (): number {
    const { task } = this
    return task.finishedAt.getTime() - task.startedAt.getTime()
  }

  get startedAt (): Date {
    return this.task.startedAt
  }

  get finishedAt (): Date {
    return this.task.finishedAt
  }

  clone (): T {
    return {
      ...this.task
    }
  }
}
