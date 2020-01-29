import * as utils from './utilities'
import { ShelterAgent, HelicopterAgent, BaseAgent, PlaceAgent } from './agents'
import { PlaceID, TransportID, Place, Base } from './entities'

export default class Environment {
  startedAt: Date
  current: Date

  baseAgents: BaseAgent[]
  shelterAgents: ShelterAgent[]
  helicopterAgents: HelicopterAgent[]

  helicopterBases: Base[]
  refuelableBaseAgents: BaseAgent[]

  placesPairToDistance: Map<string, number>

  constructor (
    startedAt: Date,
    current: Date = null,
    baseAgents: BaseAgent[] = [],
    shelterAgents: ShelterAgent[] = [],
    helicopterAgents: HelicopterAgent[] = [],
    helicopterBases: Base[] = [],
    refuelableBaseAgents: BaseAgent[] = [],
    placesPairToDistance: Map<string, number> = new Map()
  ) {
    this.startedAt = startedAt
    this.current = current || startedAt
    this.baseAgents = baseAgents
    this.shelterAgents = shelterAgents
    this.helicopterAgents = helicopterAgents
    this.helicopterBases = helicopterBases
    this.refuelableBaseAgents = refuelableBaseAgents
    this.placesPairToDistance = placesPairToDistance
  }

  addBaseAgent (baseAgent: BaseAgent): void {
    this.baseAgents.push(baseAgent)
    if (baseAgent.isHelicopterBase) this.helicopterBases.push(baseAgent.base)
    if (baseAgent.isRefuelable) this.refuelableBaseAgents.push(baseAgent)
  }

  addShelterAgent (shelterAgent: ShelterAgent): void {
    this.shelterAgents.push(shelterAgent)
  }

  addHelicopterAgent (helicopterAgent: HelicopterAgent): void {
    this.helicopterAgents.push(helicopterAgent)
  }

  updateAgentsPairToDistance (newPlaceAgent: PlaceAgent): void {
    const placeAgents: PlaceAgent[] = [...this.shelterAgents, ...this.baseAgents]

    placeAgents.forEach(placeAgent => {
      const placeID = placeAgent.place.id
      const newPlaceID = newPlaceAgent.place.id
      if (placeID === newPlaceID) return
      const pairID = utils.placesPairID(placeID, newPlaceID)
      const distance = utils.distance(placeAgent.place.position, newPlaceAgent.place.position)
      this.placesPairToDistance.set(pairID, distance)
    })
  }

  getDistance (fromPalceID: PlaceID, toPlace: PlaceID): number {
    const pairID = utils.placesPairID(fromPalceID, toPlace)
    return this.placesPairToDistance.get(pairID)
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
    return utils.dateToString(this.current)
  }

  get startedAtString (): string {
    return utils.dateToString(this.startedAt)
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
}
