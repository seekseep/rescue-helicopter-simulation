import Environment from './Environment'
import * as utils from './utilities'
import * as builders from './builders'
import config from './config'
import { PlaceID, BaseType, TransportID, Position, Project, TaskTyep, TransportTaskType, PlaceTaskType } from './entities'
import { TransportMissionService, MissionService } from './services'

export default class Simulator {
  project: Project
  environment: Environment

  constructor () {
    this.environment = null
  }

  setup (
    project: Project,
    bases: {
      id?: PlaceID;
      displayName?: string;
      position: Position;
      maxLandableCount: number;
      baseType: BaseType;
      isRefuelable: boolean;
      helicopters: {
        id?: TransportID;
        speed: number;
        displayName?: string;
        maxInjuredsCount: number;
        useRescueRate: boolean;
        schedule: {
          startHours: number;
          startMinutes: number;
          endHours: number;
          endMinutes: number;
        };
      }[];
    }[],
    shelters: {
      id?: PlaceID;
      displayName?: string;
      position: Position;
      maxLandableCount: number;
      requestedInjuredsCount: number;
    }[],
    tasks?: {
      refuel?: number;
      unload?: number;
      rescue?: number;
    }
  ): void {
    this.project = project

    const environment = new Environment(project.startedAt)
    this.environment = environment

    bases.forEach(({ helicopters, ...base }) => {
      const baseAgent = builders.agents.base(base, environment)
      environment.addBaseAgent(baseAgent)
      helicopters.forEach((helicopter) => {
        const helicopterAgent = builders.agents.helicopter(helicopter, environment)
        helicopterAgent.setInitialPlace(baseAgent)
        environment.addHelicopterAgent(helicopterAgent)
      })
    })

    shelters.forEach(shelter =>
      environment.addShelterAgent(
        builders.agents.shelter(shelter, environment)
      )
    )

    if (tasks) {
      if (tasks.rescue) config.set('TASK_DURATION_RESCUE', tasks.rescue)
      if (tasks.refuel) config.set('TASK_DURATION_REFUEL', tasks.refuel)
      if (tasks.unload) config.set('TASK_DURATION_UNLOAD', tasks.unload)
    }
  }

  simulate (): void {
    const environment: Environment = this.environment
    environment.helicopterAgents.forEach(agent => agent.action())
    environment.increment()
    if (!this.isDone) this.simulate()
  }

  get isDone (): boolean {
    return this.environment.current >= this.project.finishedAt
  }

  get stepTime (): number {
    return 60 * 1000
  }

  getResult (): string {
    function taskTypeToLabel (taskType: TaskTyep): string {
      switch (taskType) {
        case PlaceTaskType.HOLD:
        case TransportTaskType.STAY: return '滞在'
        case TransportTaskType.REFUEL:
        case PlaceTaskType.REFUEL: return '給油'
        case TransportTaskType.RESCUE:
        case PlaceTaskType.RESCUE: return '救助'
        case PlaceTaskType.UNLOAD: return '受入'
        case TransportTaskType.MOVE: return '移動'
        case TransportTaskType.WAIT: return '待機'
        case TransportTaskType.UNLOAD: return '降機'

        default: return '不明'
      }
    }

    return utils.messagesToString([
      `開始日時: ${this.project.startedAt.toLocaleString()}`,
      `終了日時: ${this.project.finishedAt.toLocaleString()}`,
      '======',
      '被災地',
      this.environment.shelterAgents.map(({ displayName, injuredsCount, rescuedInjuredsCount, requestedInjuredsCount, rescueRate }) => ([
        displayName,
        [
          `要請数: ${requestedInjuredsCount}`,
          `救助済み: ${rescuedInjuredsCount}`,
          `未救助: ${injuredsCount}`,
          `救助率: ${rescueRate * 100}%`
        ]
      ])),
      '基地',
      this.environment.baseAgents.map(({ displayName, missions }) => ([
        displayName,
        missions.map(mission => {
          const { startedAt, finishedAt } = new MissionService(mission)
          return [
            mission.displayName,
              `${startedAt.toLocaleString()} → ${finishedAt.toLocaleString()}`,
              mission.tasks.map(({ type, startedAt, finishedAt, transport }) => ([
                taskTypeToLabel(type),
                `${startedAt.toLocaleString()} → ${finishedAt.toLocaleString()} (${transport.displayName})`
              ]))
          ]
        })
      ])),
      'ヘリコプター',
      this.environment.helicopterAgents.map(({ displayName, missions, rescuedInjuredsCount }) => (
        [
          displayName,
          `救助済み負傷者数: ${rescuedInjuredsCount}`,
          missions.map(mission => {
            const { startedAt, startedIn, finishedAt, finishedIn } = new TransportMissionService(mission)
            return [
              mission.displayName,
              `${startedAt.toLocaleString()}@${startedIn.displayName} → ${finishedAt.toLocaleString()}@${finishedIn.displayName}`,
              mission.tasks.map(({ type, startedIn, startedAt, finishedIn, finishedAt, injuredsCount }) =>
                [
                  `${taskTypeToLabel(type)} ${injuredsCount ? `(負傷者数:${injuredsCount})` : ''}`,
                  `${startedAt.toLocaleString()}@${startedIn.displayName} → ${finishedAt.toLocaleString()}@${finishedIn.displayName}`
                ]
              )
            ]
          })
        ]
      ))
    ], 0)
  }
}
