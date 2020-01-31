import _ from 'lodash'

import config from '../config'
import * as builders from '../builders'
import * as utils from '../utilities'

import TransportAgent from './TransportAgent'
import BaseAgent from './BaseAgent'
import ShelterAgent from './ShelterAgent'
import Environment from '../Environment'
import {
  AgentID,
  Helicopter,
  Place,
  TransportID,
  TransportMission,
  TransportTask,
  TransportTaskType,
  TransportSchedule
} from '../entities'
import {
  MissionsService,
  TransportMissionService,
  TransportReturnMissionService
} from '../services'

export default class HelicopterAgent extends TransportAgent {
  helicopter: Helicopter

  constructor (
    id: AgentID,
    helicopter: Helicopter,
    schedule: TransportSchedule,
    environment: Environment
  ) {
    super(id, helicopter, schedule, environment)
    this.helicopter = helicopter
  }

  action (): void {
    super.action()
    if (this.isWorking) {
      return
    }

    const { shelterAgents } = this.environment
    if (shelterAgents.length < 1) {
      return
    }

    const rescueMission = this.buildOptimalRescueMission(shelterAgents)
    if (rescueMission === null) {
      return
    }

    const finishDate = this.scheduleService.getFinishDate(this.current)
    if (rescueMission.finishedAt < finishDate) {
      const returnBaseMission = this.buildLatestReturnBaseMission(rescueMission)
      const returnBaseMissionService = new TransportReturnMissionService(returnBaseMission)
      if (returnBaseMissionService.stayTaskStartedAt <= finishDate) {
        this.submitMission(rescueMission)
        return
      }
    }

    const optimalReturnBaseMission = this.buildOptimalReturnMission(this.scheduleService.lastMission)
    if (optimalReturnBaseMission.duration < 1) {
      debugger;
    }
    this.submitMission(optimalReturnBaseMission)
  }

  buildOptimalRescueMission (shelterAgents: ShelterAgent[]): (TransportMission|null) {
    shelterAgents = shelterAgents.filter(agent => agent.injuredsCount > 0)
    if (shelterAgents.length < 1) return null

    if (this.useRescueRate && shelterAgents.length > 1) {
      const rescuRateToAgents = new Map<number, ShelterAgent[]>()
      let minRescueRate = null
      shelterAgents.forEach(agent => {
        const rate = agent.rescueRate
        const agents = rescuRateToAgents.get(rate) || []
        rescuRateToAgents.set(rate, [...agents, agent])
        minRescueRate = minRescueRate === null ? rate : Math.min(rate, minRescueRate)
      })
      shelterAgents = rescuRateToAgents.get(minRescueRate)
    }

    const fastestMission = new MissionsService<TransportTaskType, TransportTask, TransportMission>(
      shelterAgents.map(shelterAgent =>
        this.buildRescueMission(shelterAgent)
      )
    ).fastestMission

    const rescueShelterAgent = this.environment.getShelterAgentByPlaceID(
      new TransportMissionService(fastestMission).rescuePlace.id
    )

    const missions = this.environment.helicopterAgents.map(agent => agent.buildRescueMission(rescueShelterAgent))

    const fastestMissions = new MissionsService(missions).fastestMissions
    if (fastestMissions.has(this.id)) {
      const mission = fastestMissions.get(this.id)
      return mission
    } else if (shelterAgents.length > 1) {
      return this.buildOptimalRescueMission(
        shelterAgents.filter(shelterAgent => shelterAgent.id !== rescueShelterAgent.id)
      )
    } else {
      return null
    }
  }

  buildOptimalReturnMission (beforeMission: TransportMission): TransportMission {
    const transportService = this.transportService
    const startedAt = beforeMission.finishedAt > this.current  ? beforeMission.finishedAt : this.current
    const startedIn = beforeMission.finishedIn
    const helicopterBases = this.environment.helicopterBases
    const fastestArrivableHelicopterBases = transportService.getFastestArrivablePlaces(startedIn, helicopterBases)
    const fastestArrivableHelicopterBase = fastestArrivableHelicopterBases[0]
    return this.buildReturnBaseMission(startedAt, startedIn, fastestArrivableHelicopterBase)
  }

  buildLatestReturnBaseMission (beforeMission: TransportMission): TransportMission {
    const transportService = this.transportService
    const { finishedAt, finishedIn } = beforeMission
    const helicopterBases = this.environment.helicopterBases
    const latestArrivableHelicopterBases = transportService.getLatestArrivablePlaces(finishedIn, helicopterBases)
    const latestArrivableHelicopterBase = latestArrivableHelicopterBases[0]
    return this.buildReturnBaseMission(finishedAt, finishedIn, latestArrivableHelicopterBase)
  }

  buildRescueMission (shelterAgent: ShelterAgent): TransportMission {
    const tasks: TransportTask[] = []

    const { environment, transportService } = this
    const { lastMission } = this.scheduleService
    const startedAt = lastMission.finishedAt > this.current  ? lastMission.finishedAt : this.current

    const moveToShelterTask = transportService.buildMoveToPlaceTask(
      startedAt,
      lastMission.finishedIn,
      shelterAgent.place
    )
    tasks.push(moveToShelterTask)

    const rescueTask = transportService.buildRescueTask(
      shelterAgent.getLandableAt(moveToShelterTask.finishedAt, +config.get('TASK_DURATION_RESCUE')),
      shelterAgent.place,
      Math.min(shelterAgent.willInjuredsCount, this.helicopter.maxInjuredsCount)
    )

    if (!utils.equalDate(moveToShelterTask.finishedAt, rescueTask.startedAt)) {
      tasks.push(
        builders.tasks.transports.wait(
          moveToShelterTask.finishedAt,
          rescueTask.startedAt,
          shelterAgent.place
        )
      )
    }
    tasks.push(rescueTask)

    const unloadBaseAgent = environment.baseAgents.map(baseAgent => {
      const moveToUnloadTask = transportService.buildMoveToPlaceTask(
        rescueTask.finishedAt,
        rescueTask.finishedIn,
        baseAgent.place
      )
      return {
        baseAgent,
        landableAt: baseAgent.getLandableAt(
          moveToUnloadTask.finishedAt,
          +config.get('TASK_DURATION_UNLOAD') + (baseAgent.isRefuelable ? +config.get('TASK_DURATION_REFUEL') : 0)
        )
      }
    }).sort((a, b) => a.landableAt.getTime() - b.landableAt.getTime())[0].baseAgent

    const moveToUnloadBaseTask = transportService.buildMoveToPlaceTask(
      rescueTask.finishedAt,
      shelterAgent.place,
      unloadBaseAgent.place
    )
    tasks.push(moveToUnloadBaseTask)

    const unloadTask = transportService.buildUnloadTask(
      unloadBaseAgent.getLandableAt(moveToUnloadBaseTask.finishedAt, +config.get('TASK_DURATION_UNLOAD')),
      unloadBaseAgent.place,
      rescueTask.injuredsCount
    )

    if (!utils.equalDate(moveToUnloadBaseTask.finishedAt, unloadTask.startedAt)) {
      tasks.push(
        transportService.buildWaitTask(
          moveToUnloadBaseTask.finishedAt,
          unloadTask.startedAt,
          unloadBaseAgent.place
        )
      )
    }
    tasks.push(unloadTask)

    let refuelableBaseAgents = [...environment.refuelableBaseAgents]

    if (unloadBaseAgent.isRefuelable) {
      const clonedUnloadBaseAgent = unloadBaseAgent.clone()
      clonedUnloadBaseAgent.addMission(
        builders.missions.places.unloadByTransportTaskAndTransport(
          clonedUnloadBaseAgent.id,
          unloadTask,
          this.transport
        )
      )
      refuelableBaseAgents = refuelableBaseAgents.map(baseAgent =>
        baseAgent.id === clonedUnloadBaseAgent.id ? clonedUnloadBaseAgent : baseAgent
      )
    }

    const optimalRefuelBaseAgent = refuelableBaseAgents.map(refualbeBaseAgent => {
      const moveToUnloadTask = transportService.buildMoveToPlaceTask(
        unloadTask.finishedAt,
        unloadTask.finishedIn,
        refualbeBaseAgent.place
      )
      return {
        baseAgent: refualbeBaseAgent,
        landableAt: refualbeBaseAgent.getLandableAt(
          moveToUnloadTask.finishedAt,
          +config.get('TASK_DURATION_REFUEL')
        )
      }
    }).sort((a, b) => a.landableAt.getTime() - b.landableAt.getTime())[0].baseAgent

    const moveToRefuelableBaseTask = transportService.buildMoveToPlaceTask(
      unloadTask.finishedAt,
      unloadTask.finishedIn,
      optimalRefuelBaseAgent.place
    )
    if (moveToRefuelableBaseTask.duration > 0) {
      tasks.push(moveToRefuelableBaseTask)
    }

    const refuelTask = transportService.buildRefuelTask(
      optimalRefuelBaseAgent.getLandableAt(moveToRefuelableBaseTask.finishedAt, +config.get('TASK_DURATION_REFUEL')),
      optimalRefuelBaseAgent.place
    )

    if (!utils.equalDate(moveToRefuelableBaseTask.finishedAt, refuelTask.startedAt)) {
      tasks.push(
        transportService.buildWaitTask(
          moveToRefuelableBaseTask.finishedAt,
          refuelTask.startedAt,
          refuelTask.startedIn
        )
      )
    }
    tasks.push(refuelTask)

    return builders.missions.transports.rescue(this.id, tasks)
  }

  buildReturnBaseMission (startedAt: Date, startedIn: Place, stayedIn: Place): TransportMission {
    const { environment, transportService, scheduleService } = this
    const tasks = []

    const baseAgent = environment.getBaseAgentByPlaceID(stayedIn.id).clone()
    const startDateOfNextDay = scheduleService.getStartDateOfNextDay(this.current)

    const moveToReturnBaseTask = transportService.buildMoveToPlaceTask(
      startedAt,
      startedIn,
      stayedIn
    )
    tasks.push(moveToReturnBaseTask)

    const refuelTask = transportService.buildRefuelTask(
      baseAgent.getLandableAt(
        moveToReturnBaseTask.finishedAt,
        utils.diffDates(moveToReturnBaseTask.finishedAt, startDateOfNextDay)
      ),
      stayedIn
    )
    baseAgent.addMission(
      builders.missions.places.refuelByTransportTaskAndTransport(
        baseAgent.id,
        refuelTask,
        this.transport
      )
    )

    if (!utils.equalDate(moveToReturnBaseTask.finishedAt, refuelTask.startedAt)) {
      tasks.push(
        transportService.buildWaitTask(
          moveToReturnBaseTask.finishedAt,
          refuelTask.startedAt,
          stayedIn
        )
      )
    }
    tasks.push(refuelTask)

    const stayTask = transportService.buildStayTask(
      refuelTask.finishedAt,
      startDateOfNextDay,
      stayedIn
    )
    tasks.push(stayTask)

    return builders.missions.transports.returnBase(this.id, tasks)
  }

  setInitialPlace (baseAgent: BaseAgent): void {
    const readyMission = builders.missions.transports.ready(
      this.id,
      this.environment.startedAt,
      baseAgent.place
    )
    this.submitMission(readyMission)

    const startDate = this.scheduleService.getStartDate(this.current)
    const finishedAt = readyMission.finishedAt
    if (finishedAt < startDate) {
      const stayTask = this.transportService.buildStayTask(
        finishedAt, startDate, baseAgent.place
      )
      const stayMission = builders.missions.transports.stay(this.id, [stayTask])
      this.submitMission(stayMission)
    }
  }

  submitMission (mission: TransportMission): void {
    const { environment } = this

    mission.tasks.forEach(task => {
      switch (task.type) {
        case TransportTaskType.REFUEL:
          this.submitRefuelTask(environment, task)
          break
        case TransportTaskType.RESCUE:
          this.submitRescueTask(environment, task)
          break
        case TransportTaskType.UNLOAD:
          this.submitUnloadTask(environment, task)
          break
        case TransportTaskType.STAY:
          this.submitStayTask(environment, task)
          break
        default:
      }
    })

    this.addMission(mission)
  }

  submitRefuelTask (environment: Environment, refuelTask: TransportTask): void {
    const baseAgent = environment.getBaseAgentByPlaceID(refuelTask.startedIn.id)
    baseAgent.addMission(
      builders.missions.places.refuelByTransportTaskAndTransport(
        baseAgent.id,
        refuelTask,
        this.transport
      )
    )
  }

  submitRescueTask (environment: Environment, rescueTask: TransportTask): void {
    const shelterAgent = environment.getShelterAgentByPlaceID(rescueTask.startedIn.id)
    shelterAgent.addMission(
      builders.missions.places.rescueByTransportTaskAndTransport(
        shelterAgent.id,
        rescueTask,
        this.transport
      )
    )
  }

  submitUnloadTask (environment: Environment, unloadTask: TransportTask): void {
    const baseAgent = environment.getBaseAgentByPlaceID(unloadTask.startedIn.id)
    baseAgent.addMission(
      builders.missions.places.unloadByTransportTaskAndTransport(
        baseAgent.id,
        unloadTask,
        this.transport
      )
    )
  }

  submitStayTask (environment: Environment, stayTask: TransportTask): void {
    const baseAgent = environment.getBaseAgentByPlaceID(stayTask.startedIn.id)
    baseAgent.addMission(
      builders.missions.places.holdByTransportTaskAndTransport(
        baseAgent.id,
        stayTask,
        this.transport
      )
    )
  }

  get helicopterID (): TransportID {
    return this.helicopter.id
  }

  get rescuedInjuredsCount (): number {
    return this.schedule.cache.rescuedInjuredsCount
  }
}
