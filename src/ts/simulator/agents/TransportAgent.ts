import _ from 'lodash'

import Agent from './Agent'
import Environment from '../Environment'
import {
  AgentID,
  Transport,
  TransportID,
  TransportTask,
  TransportTaskType,
  TransportSchedule,
  TransportScheduleCache,
  TransportMission
} from '../entities'
import {
  TransportScheduleService, TransportService
} from '../services'

export default class TransportAgent extends Agent<TransportTaskType, TransportTask, TransportMission, TransportScheduleCache> {
  transport: Transport
  transportService: TransportService
  schedule: TransportSchedule
  scheduleService: TransportScheduleService

  constructor (
    id: AgentID,
    transport: Transport,
    schedule: TransportSchedule,
    environment: Environment
  ) {
    super(id, schedule, environment)
    this.transport = transport
    this.transportService = new TransportService(this.transport)
    this.scheduleService = new TransportScheduleService(this.schedule)
  }

  get displayName (): string {
    return this.transport.displayName
  }

  get transportID (): TransportID {
    return this.transport.id
  }

  get speed (): number {
    return this.transport.speed
  }

  get useRescueRate (): boolean {
    return this.transport.useRescueRate
  }
}
