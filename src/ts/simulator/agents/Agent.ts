import _ from 'lodash'

import Environment from '../Environment'
import { AgentID, Schedule, Mission, Task, ScheduleCache } from '../entities'
import { ScheduleService } from '../services'

export default class Agent<TT, T extends Task<TT>, M extends Mission<TT, T>, C extends ScheduleCache<TT, T, M>> {
  id: number
  schedule: Schedule<TT, T, M, C>
  scheduleService: ScheduleService<TT, T, M, C>
  environment: Environment

  constructor (id: AgentID, schedule: Schedule<TT, T, M, C>, environment: Environment) {
    this.id = id
    this.schedule = schedule
    this.environment = environment
    this.scheduleService = new ScheduleService<TT, T, M, C>(this.schedule)
  }

  action (): void{
    const { current } = this.environment
    const currentTime = current.getTime()
    const startedTasks = this.scheduleService.getTasksByStartedAtTime(currentTime)
    if (startedTasks) {
      startedTasks.forEach(startedTask => {
        this.scheduleService.updateCacheWithStartedTask(startedTask, current)
      })
    }
    const finishedTasks = this.scheduleService.getTasksByFinishedAtTime(currentTime)
    if (finishedTasks) {
      finishedTasks.forEach(finishedTask => {
        this.scheduleService.updateCacheWithFinishedTask(finishedTask, current)
      })
    }
  }

  addMission (mission: M): void {
    this.scheduleService.addMission(mission, this.current)
  }

  get current (): Date {
    return this.environment.current
  }

  get isWorking (): boolean {
    return this.scheduleService.isWorking(this.current)
  }

  get isActive (): boolean {
    return this.scheduleService.isActive(this.current)
  }

  get missions (): M[] {
    return this.schedule.missions
  }

  clone (environment?: Environment): Agent<TT, T, M, C> {
    return new Agent<TT, T, M, C>(
      this.id,
      _.cloneDeep(this.schedule),
      environment || this.environment
    )
  }
}
