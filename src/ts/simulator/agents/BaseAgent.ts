import PlaceAgent from './PlaceAgent'
import Environment from '../Environment'

import { AgentID, Base, PlaceTaskType, PlaceTask, Schedule, BaseType } from '../entities'
import config from '../config'
import * as utils from '../utilities'

export default class BaseAgent extends PlaceAgent {
  base: Base

  constructor (id: AgentID, base: Base, schedule: Schedule<PlaceTaskType, PlaceTask>, environment: Environment) {
    super(id, base, schedule, environment)
    this.base = base
  }

  get isRefuelable (): boolean {
    return this.base.isRefuelable
  }

  get isHelicopterBase (): boolean {
    return this.base.baseType === BaseType.HELICOPTER
  }

  getIsRefualableAt (startedAt: Date): boolean {
    if (!this.isRefuelable) return false

    const landableAt = this.getLandableAt(startedAt, +config.get('TASK_DURATION_REFUEL'))

    return utils.equalDate(startedAt, landableAt)
  }

  clone (environment?: Environment): BaseAgent {
    return new BaseAgent(
      this.id,
      this.base,
      this.scheduleService.clone(),
      environment || this.environment
    )
  }
}
