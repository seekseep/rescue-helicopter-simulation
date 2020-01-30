import * as utils from '../../utilities'

import * as places from './places'
import * as transports from './transports'
import { AgentID, Mission, Task } from '../../entities'

const mission = <TT, T extends Task<TT>>(agentID: AgentID, displayName: string, tasks: T[], id?:number): Mission<TT, T> => {
  const startedAt = tasks[0].startedAt
  const finishedAt = tasks[tasks.length - 1].finishedAt
  return {
    id: id || utils.getNewID(),
    agentID,
    displayName,
    startedAt,
    finishedAt,
    duration: utils.diffDates(startedAt, finishedAt),
    tasks
  }
}

export {
  mission,
  places,
  transports
}
