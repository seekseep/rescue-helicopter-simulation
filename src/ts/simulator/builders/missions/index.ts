import * as places from './places'
import * as transports from './transports'
import { AgentID, Mission, Task } from '../../entities'

const mission = <TT, T extends Task<TT>>(agentID: AgentID, tasks: T[]): Mission<TT, T> => ({
  agentID,
  tasks
})

export {
  mission,
  places,
  transports
}
