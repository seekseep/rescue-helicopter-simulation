import _ from 'lodash'

import Environment from '../Environment'
import { AgentID, Schedule, Mission, Task, ScheduleCache, GeneralTaskType,GeneralTask } from '../entities'
import { ScheduleService } from '../services'
import * as utils from '../utilities'

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
    this.scheduleService.updateCacheWithCurrent(this.current)
  }

  addMission (mission: M): void {
    this.scheduleService.addMission(mission, this.current)
  }

  get current (): Date {
    return this.environment.current
  }

  get isWorking(): boolean {
    return this.scheduleService.isWorking
  }

  get isActive (): boolean {
    return this.scheduleService.isActive(this.current)
  }

  get missions (): M[] {
    return this.schedule.missions
  }
}
