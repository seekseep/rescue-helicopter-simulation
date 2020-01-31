import Environment from './Environment'
import * as builders from './builders'
import config from './config'
import { PlaceID, BaseType, TransportID, Position, Project } from './entities'

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
        maxContinuousFlightTime: number;
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
      helicopters.forEach(helicopter => {
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

  simulate (excuteCallback: (date: Date) => void, doneCallbck: () => void): void {
    const environment: Environment = this.environment

    environment.shelterAgents.forEach(agent => agent.action())
    environment.baseAgents.forEach(agent => agent.action())
    environment.helicopterAgents.forEach(agent => agent.action())

    excuteCallback(this.environment.current)
    environment.increment()

    if (!this.isDone) {
      window.requestAnimationFrame(() => this.simulate(excuteCallback, doneCallbck))
      return
    }
    doneCallbck()
  }

  start (excuteCallback: (progress: number) => void): Promise<void> {
    return new Promise(resolve => {
      this.simulate((date) => {
        const progress = (
          (date.getTime() - this.project.startedAt.getTime()) /
          (this.project.finishedAt.getTime() - this.project.startedAt.getTime())
        )
        excuteCallback(progress)
      }, resolve)
    })
  }

  get isDone (): boolean {
    return this.environment.current >= this.project.finishedAt
  }

  get stepTime (): number {
    return 60 * 1000
  }

  getResult (): string {
    const { project, environment } = this
    return builders.texts.result(project, environment)
  }
}
