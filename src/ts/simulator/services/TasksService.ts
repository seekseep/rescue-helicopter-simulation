import { Task } from '../entities/tasks'
import TaskService from './TaskService'

export default class TasksService<TT, T extends Task<TT>> {
  tasks: T[]
  constructor (tasks: T[]) {
    this.tasks = tasks
  }

  clone (): T[] {
    return this.tasks.map(task => new TaskService(task).clone())
  }
}
