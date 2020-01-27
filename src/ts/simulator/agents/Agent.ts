import Environment from '../Environment'
import { AgentID, Schedule, Mission, Task } from '../entities'
import { ScheduleService } from '../services'
import { GeneralTask } from '../entities/tasks'

export default class Agent<TT, T extends Task<TT>> {
  id: number
  environment: Environment
  schedule: Schedule<TT, T>

  constructor (id: AgentID, schedule: Schedule<TT, T>, environment: Environment) {
    this.id = id
    this.environment = environment
    this.schedule = schedule
  }

  action (): void{
    // do something
  }

  addMission (mission: Mission<TT, T>): void {
    this.scheduleService.addMission(mission)
  }

  get current (): Date {
    return this.environment.current
  }

  get scheduleService (): ScheduleService<TT, T> {
    return new ScheduleService<TT, T>(this.schedule)
  }

  get isWorking (): boolean {
    return this.scheduleService.isWorking(
      this.current
    )
  }

  get isActive (): boolean {
    return this.scheduleService.isActive(
      this.current
    )
  }

  get missions (): Mission<TT, T>[] {
    return this.schedule.missions
  }

  getFreeTimes (fromDate: Date): GeneralTask[] {
    return this.scheduleService.getFreeTasks(1, fromDate)
  }

  clone (environment?: Environment): Agent<TT, T> {
    return new Agent<TT, T>(
      this.id,
      new ScheduleService<TT, T>(this.schedule).clone(),
      environment || this.environment
    )
  }
}
