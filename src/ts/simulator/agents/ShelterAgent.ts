import PlaceAgent from './PlaceAgent'
import Environment from '../Environment'
import {
  AgentID,
  Shelter,
  ShelterSnapshot,
  PlaceSchedule
} from '../entities'
import {
  ShelterScheduleService
} from '../services'

export default class ShelterAgent extends PlaceAgent {
  shelter: Shelter

  constructor (id: AgentID, shelter: Shelter, schedule: PlaceSchedule, environment: Environment) {
    super(id, shelter, schedule, environment)
    this.shelter = shelter
  }

  get scheduleService (): ShelterScheduleService {
    return new ShelterScheduleService(this.schedule)
  }

  get requestedInjuredsCount (): number {
    return this.shelter.requestedInjuredsCount
  }

  get injuredsCount (): number {
    const requested = this.requestedInjuredsCount
    const rescuedInjuredsCount = this.getRescuedInjuredsCount(this.current)
    return requested - rescuedInjuredsCount
  }

  get displayName (): string {
    return this.shelter.displayName
  }

  getRescueRate (date: Date): number {
    return this.getRescuedInjuredsCount(date) / this.requestedInjuredsCount
  }

  getRescuedInjuredsCount (date: Date): number {
    return this.scheduleService.getRescuedInjuredsCount(date)
  }

  getShelterSnapshot (createdAt: Date): ShelterSnapshot {
    return {
      ...this.shelter,
      createdAt,
      rescueRate: this.getRescueRate(createdAt),
      rescuedInjuredsCount: this.getRescuedInjuredsCount(createdAt)
    }
  }

  clone (environment?: Environment): ShelterAgent {
    return new ShelterAgent(
      this.id,
      this.shelter,
      this.scheduleService.clone(),
      environment || this.environment
    )
  }
}
