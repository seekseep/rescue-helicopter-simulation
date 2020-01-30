import _ from 'lodash'
import PlaceAgent from './PlaceAgent'
import Environment from '../Environment'

import {
  AgentID,
  Base,
  BaseType,
  BaseSchedule,
  GeneralTask,
  GeneralTaskType
} from '../entities'
import {
  BaseScheduleService
} from '../services'
import * as utils from '../utilities'

export default class BaseAgent extends PlaceAgent {
  base: Base
  schedule: BaseSchedule
  scheduleService: BaseScheduleService

  constructor (
    id: AgentID,
    base: Base,
    schedule: BaseSchedule,
    environment: Environment
  ) {
    super(id, base, schedule, environment)
    this.base = base
    this.scheduleService = new BaseScheduleService(this.schedule)
  }

  get isRefuelable (): boolean {
    return this.base.isRefuelable
  }

  get isHelicopterBase (): boolean {
    return this.base.baseType === BaseType.HELICOPTER
  }

  clone (environment?: Environment): BaseAgent {
    const { cache } = this.schedule
    return new BaseAgent(
      this.id,
      this.base,
      {
        ...this.schedule,
        missions: [...this.schedule.missions],
        cache: {
          lastMission: cache.lastMission,
          freeTasks: utils.copyTasksArray<GeneralTaskType, GeneralTask>(cache.freeTasks),
          taskTypeToTasks: utils.copyTaskTypeToTasksMap(cache.taskTypeToTasks),
          finishedAtTimeToTasks: utils.copyNumberToTasksMap(cache.finishedAtTimeToTasks),
          startedAtTimeToMissions: utils.copyNumberToMissionsMap(cache.startedAtTimeToMissions),
          finishedAtTimeToMissions: utils.copyNumberToMissionsMap(cache.finishedAtTimeToMissions),
          activeMissions: utils.copyNumberToMissionMap(cache.activeMissions),
          notFinishedMissions: utils.copyNumberToMissionMap(cache.notFinishedMissions),
          notPassedMissionPoints: utils.copyNumberToDateMap(cache.notPassedMissionPoints),
          injuredsCount: cache.injuredsCount,
        }
      },
      environment || this.environment
    )
  }
}
