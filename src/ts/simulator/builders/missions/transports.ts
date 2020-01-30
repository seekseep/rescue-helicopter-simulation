import * as utils from '../../utilities'
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
  id: utils.getNewID(),
  agentID,
  displayName: '準備',
  startedAt,
  startedIn: refueledIn,
  finishedAt: startedAt,
  finishedIn: refueledIn,
  duration: 0,
  tasks: [
    tasksBuilder.refuel(startedAt, startedAt, refueledIn)
  ]
})

export const rescue = (
  agentID: AgentID,
  tasks: TransportTask[]
): TransportMission => ({
  id: utils.getNewID(),
  agentID,
  displayName: '救助',
  startedAt: tasks[0].startedAt,
  startedIn: tasks[0].startedIn,
  finishedAt: tasks[tasks.length - 1].finishedAt,
  finishedIn: tasks[tasks.length - 1].finishedIn,
  duration: utils.diffDates(tasks[0].startedAt, tasks[tasks.length - 1].finishedAt),
  tasks
})

export const returnBase = (
  agentID: AgentID,
  tasks: TransportTask[]
): TransportMission => ({
  id: utils.getNewID(),
  agentID,
  displayName: '帰還',
  startedAt: tasks[0].startedAt,
  startedIn: tasks[0].startedIn,
  finishedAt: tasks[tasks.length - 1].finishedAt,
  finishedIn: tasks[tasks.length - 1].finishedIn,
  duration: utils.diffDates(tasks[0].startedAt, tasks[tasks.length - 1].finishedAt),
  tasks
})

export const stay = (
  agentID: AgentID,
  tasks: TransportTask[]
): TransportMission => ({
  id: utils.getNewID(),
  agentID,
  displayName: '滞在',
  startedAt: tasks[0].startedAt,
  startedIn: tasks[0].startedIn,
  finishedAt: tasks[tasks.length - 1].finishedAt,
  finishedIn: tasks[tasks.length - 1].finishedIn,
  duration: utils.diffDates(tasks[0].startedAt, tasks[tasks.length - 1].finishedAt),
  tasks
})
