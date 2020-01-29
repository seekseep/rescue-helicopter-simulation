import TransportMissionService from './TransportMissionService'

export default class TransportReturnMissionService extends TransportMissionService {
  get stayTaskStartedAt (): Date {
    const stayTask = this.stayTasks[0]
    return stayTask.startedAt
  }
}
