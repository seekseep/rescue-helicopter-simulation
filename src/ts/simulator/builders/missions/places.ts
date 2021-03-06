import * as utils from '../../utilities'
import {
  AgentID,
  Transport,
  TransportTask,
  PlaceMission
} from '../../entities'
import * as tasksBuilder from '../tasks'

export const refuel = (
  agentID: AgentID,
  startedAt: Date,
  finishedAt: Date,
  transport: Transport
): PlaceMission => ({
  id: utils.getNewID(),
  agentID,
  displayName: '給油',
  startedAt,
  finishedAt,
  duration: utils.diffDates(startedAt, finishedAt),
  tasks: [
    tasksBuilder.places.refuel(startedAt, finishedAt, transport)
  ]
})

export const refuelByTransportTaskAndTransport = (
  agentID: AgentID,
  refuelTask: TransportTask,
  transport: Transport
): PlaceMission => (
  refuel(
    agentID,
    refuelTask.startedAt,
    refuelTask.finishedAt,
    transport
  )
)

export const unload = (
  agentID: AgentID,
  startedAt: Date,
  finishedAt: Date,
  transport: Transport,
  injuredsCount: number
): PlaceMission => ({
  id: utils.getNewID(),
  agentID,
  displayName: '負傷者の受け入れ',
  startedAt,
  finishedAt,
  duration: utils.diffDates(startedAt, finishedAt),
  tasks: [
    tasksBuilder.places.unload(startedAt, finishedAt, transport, injuredsCount)
  ]
})

export const unloadByTransportTaskAndTransport = (
  agentID: AgentID,
  unloadTask: TransportTask,
  transport: Transport
): PlaceMission => unload(
  agentID,
  unloadTask.startedAt,
  unloadTask.finishedAt,
  transport,
  unloadTask.injuredsCount
)

export const rescue = (
  agentID: AgentID,
  startedAt: Date,
  finishedAt: Date,
  transport: Transport,
  injuredsCount: number
): PlaceMission => ({
  id: utils.getNewID(),
  agentID,
  displayName: '救助',
  startedAt,
  finishedAt,
  duration: utils.diffDates(startedAt, finishedAt),
  tasks: [
    tasksBuilder.places.rescue(startedAt, finishedAt, transport, injuredsCount)
  ]
})

export const rescueByTransportTaskAndTransport = (
  agentID: AgentID,
  rescueTask: TransportTask,
  transport: Transport
): PlaceMission => rescue(
  agentID,
  rescueTask.startedAt,
  rescueTask.finishedAt,
  transport,
  rescueTask.injuredsCount
)

export const hold = (
  agentID,
  startedAt: Date,
  finishedAt: Date,
  transport: Transport
): PlaceMission => ({
  id: utils.getNewID(),
  agentID,
  displayName: 'ヘリコプターの停留',
  startedAt,
  finishedAt,
  duration: utils.diffDates(startedAt, finishedAt),
  tasks: [
    tasksBuilder.places.hold(
      startedAt,
      finishedAt,
      transport
    )
  ]
})

export const holdByTransportTaskAndTransport = (
  agentID,
  stayTask: TransportTask,
  transport: Transport
): PlaceMission => hold(
  agentID,
  stayTask.startedAt,
  stayTask.finishedAt,
  transport
)
