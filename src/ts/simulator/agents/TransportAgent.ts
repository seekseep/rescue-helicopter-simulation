import Agent from './Agent'
import Environment from '../Environment'
import {
  AgentID,
  Transport,
  TransportID,
  TransportTask,
  TransportTaskType,
  TransportSchedule
} from '../entities'
import {
  TransportScheduleServive
} from '../services'

export default class TransportAgent extends Agent<TransportTaskType, TransportTask> {
  transport: Transport

  constructor (id: AgentID, transport: Transport, schedule: TransportSchedule, environment: Environment) {
    super(id, schedule, environment)
    this.transport = transport
  }

  get displayName (): string {
    return this.transport.displayName
  }

  get transportID (): TransportID {
    return this.transport.id
  }

  get scheduleService (): TransportScheduleServive {
    return new TransportScheduleServive(this.schedule)
  }

  get speed (): number {
    return this.transport.speed
  }

  get useRescueRate (): boolean {
    return this.transport.useRescueRate
  }

  clone (environment?: Environment): TransportAgent {
    return new TransportAgent(
      this.id,
      this.transport,
      this.scheduleService.clone(),
      environment || this.environment
    )
  }
}
