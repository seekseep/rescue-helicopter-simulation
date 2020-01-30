import _ from 'lodash'

import PlaceAgent from './PlaceAgent'
import Environment from '../Environment'
import {
  AgentID,
  Shelter,
  ShelterSchedule,
  PlaceMission
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

  addMission (mission: PlaceMission): void {
    super.addMission(mission)
  }

  get displayName (): string {
    return this.shelter.displayName
  }

  get requestedInjuredsCount (): number {
    return this.shelter.requestedInjuredsCount
  }

  get rescuedInjuredsCount(): number {
    return this.scheduleService.rescuedInjuredsCount
  }

  get willRescuedInjuredsCount (): number {
    return this.scheduleService.willRescuedInjuredsCount
  }

  get injuredsCount (): number {
    const requested = this.requestedInjuredsCount
    const rescued = this.rescuedInjuredsCount
    return requested - rescued
  }

  get willInjuredsCount (): number {
    const requested = this.requestedInjuredsCount
    const willRescued = this.willRescuedInjuredsCount
    return requested - willRescued
  }

  get rescueRate (): number {
    const requested = this.requestedInjuredsCount
    const rescued = this.rescuedInjuredsCount
    return rescued / requested
  }
}
