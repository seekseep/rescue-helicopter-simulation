import _ from 'lodash'

import PlaceAgent from './PlaceAgent'
import Environment from '../Environment'
import {
  AgentID,
  Shelter,
  ShelterSchedule
} from '../entities'
import {
  ShelterScheduleService
} from '../services'

export default class ShelterAgent extends PlaceAgent {
  shelter: Shelter
  schedule: ShelterSchedule
  scheduleService: ShelterScheduleService

  constructor (
    id: AgentID,
    shelter: Shelter,
    schedule: ShelterSchedule,
    environment: Environment
  ) {
    super(id, shelter, schedule, environment)
    this.shelter = shelter
    this.scheduleService = new ShelterScheduleService(this.schedule)
  }

  get displayName (): string {
    return this.shelter.displayName
  }

  get requestedInjuredsCount (): number {
    return this.shelter.requestedInjuredsCount
  }

  get injuredsCount (): number {
    const requested = this.requestedInjuredsCount
    const rescued = this.rescuedInjuredsCount
    return requested - rescued
  }

  get willRescuedInjuredsCount (): number {
    return this.scheduleService.willRescuedInjuredsCount
  }

  get willInjuredsCount (): number {
    return this.requestedInjuredsCount - this.willRescuedInjuredsCount
  }

  get rescuedInjuredsCount (): number {
    return this.scheduleService.rescuedInjuredsCount
  }

  get rescueRate (): number {
    return this.rescuedInjuredsCount / this.requestedInjuredsCount
  }

  getRescueRate (date: Date): number {
    return this.getRescuedInjuredsCount(date) / this.requestedInjuredsCount
  }

  getRescuedInjuredsCount (date: Date): number {
    return this.scheduleService.getRescuedInjuredsCount(date)
  }

  clone (environment?: Environment): ShelterAgent {
    return new ShelterAgent(
      this.id,
      this.shelter,
      _.cloneDeep(this.schedule),
      environment || this.environment
    )
  }
}
