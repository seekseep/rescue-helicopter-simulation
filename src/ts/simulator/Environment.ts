import { dateToString } from './utilities'
import { ShelterAgent, HelicopterAgent, BaseAgent } from './agents'
import { PlaceID, TransportID, Place } from './entities'

export default class Environment {
  startedAt: Date
  current: Date

  baseAgents: BaseAgent[]
  shelterAgents: ShelterAgent[]
  helicopterAgents: HelicopterAgent[]

  constructor (
    startedAt: Date,
    current: Date = null,
    baseAgents: BaseAgent[] = [],
    shelterAgents: ShelterAgent[] = [],
    helicopterAgents: HelicopterAgent[] = []
  ) {
    this.startedAt = startedAt
    this.current = current || startedAt
    this.baseAgents = baseAgents
    this.shelterAgents = shelterAgents
    this.helicopterAgents = helicopterAgents
  }

  addBaseAgent (baseAgent: BaseAgent): void {
    this.baseAgents.push(baseAgent)
  }

  addShelterAgent (shelterAgent: ShelterAgent): void {
    this.shelterAgents.push(shelterAgent)
  }

  addHelicopterAgent (helicopterAgent: HelicopterAgent): void {
    this.helicopterAgents.push(helicopterAgent)
  }

  increment (): void {
    this.current = new Date(this.current.getTime() + this.incrementStep)
  }

  get elapsedTime (): number {
    return this.current.getTime() - this.startedAt.getTime()
  }

  get incrementStep (): number {
    return 60 * 1000
  }

  get currentString (): string {
    return dateToString(this.current)
  }

  get startedAtString (): string {
    return dateToString(this.startedAt)
  }

  getPlaceByPlaceID (placeID: PlaceID): Place|null {
    const baseAgent = this.getBaseAgentByPlaceID(placeID)
    if (baseAgent) return baseAgent.place

    const shelterAgent = this.getShelterAgentByPlaceID(placeID)
    if (shelterAgent) return shelterAgent.place

    throw new Error(`Not found place placeID=${placeID}`)
  }

  getBaseAgentByPlaceID (placeID: PlaceID): BaseAgent | null {
    return this.baseAgents.find(agent => agent.placeID === placeID) || null
  }

  getShelterAgentByPlaceID (placeID: PlaceID): ShelterAgent | null {
    return this.shelterAgents.find(agent => agent.placeID === placeID) || null
  }

  getHelicopterAgentByTransport (transportID: TransportID): HelicopterAgent | null {
    return this.helicopterAgents.find(agent => agent.transportID === transportID) || null
  }

  clone (): Environment {
    const environment = new Environment(this.startedAt)

    this.baseAgents.forEach(baseAgent => {
      environment.addBaseAgent(baseAgent.clone(environment))
    })

    this.shelterAgents.forEach(shelterAgent => {
      environment.addShelterAgent(shelterAgent.clone(environment))
    })

    this.helicopterAgents.forEach(helicopterAgent => {
      environment.addHelicopterAgent(helicopterAgent.clone(environment))
    })

    return environment
  }
}
