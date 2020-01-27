import {
  AgentID,
  Place,
  TransportMission,
  TransportTask
} from '../../entities'
import * as tasksBuilder from '../tasks/transports'

export const ready = (
  agentID: AgentID,
  startedAt: Date,
  refueledIn: Place
): TransportMission => ({
  agentID,
  displayName: '準備',
  tasks: [
    tasksBuilder.refuel(startedAt, startedAt, refueledIn)
  ]
})

export const rescue = (
  agentID: AgentID,
  tasks: TransportTask[]
): TransportMission => ({
  agentID,
  displayName: '救助',
  tasks
})

export const returnBase = (
  agentID: AgentID,
  tasks: TransportTask[]
): TransportMission => ({
  agentID,
  displayName: '帰還',
  tasks
})

export const stay = (
  agentID: AgentID,
  tasks: TransportTask[]
): TransportMission => ({
  agentID,
  displayName: '滞在',
  tasks
})
