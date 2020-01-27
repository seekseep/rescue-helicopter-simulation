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
  Mission,
  Place,
  Schedule,
  TransportID,
  TransportMission,
  TransportTask,
  TransportTaskType
} from '../entities'
import {
  MissionsService,
  ShelterSnapshotsService,
  TransportMissionService,
  TransportReturnMissionService,
  MissionService,
  TransportService
} from '../services'

export default class HelicopterAgent extends TransportAgent {
  helicopter: Helicopter

  constructor (id: AgentID, helicopter: Helicopter, schedule: Schedule<TransportTaskType, TransportTask>, environment: Environment) {
    super(id, helicopter, schedule, environment)
    this.helicopter = helicopter
  }

  action (): void {
    if (this.isWorking) return

    const { shelterAgents } = this.environment
    if (shelterAgents.length < 1) return

    const rescueMission = this.buildOptimalRescueMission(shelterAgents)
    if (rescueMission === null) return

    const returnBaseMission = this.buildLatestReturnBaseMission(rescueMission)
    const returnBaseMissionService = new TransportReturnMissionService(returnBaseMission)
    const finishDate = this.scheduleService.getFinishDate(this.current)
    if (returnBaseMissionService.getStayTaskStartedAt <= finishDate) {
      this.submitMission(rescueMission)
      return
    }

    const optimalReturnBaseMission = this.buildOptimalReturnMission(this.scheduleService.lastMission)
    this.submitMission(optimalReturnBaseMission)
  }

  buildOptimalRescueMission (shelterAgents: ShelterAgent[]): (Mission<TransportTaskType, TransportTask>|null) {
    shelterAgents = shelterAgents.filter(agent => agent.injuredsCount > 0)

    if (this.useRescueRate) {
      shelterAgents = new ShelterSnapshotsService(
        shelterAgents
          .map(shelterAgent => shelterAgent.getShelterSnapshot(this.current))
      ).minRescueRateShelterSnapshots.map(shelterSnapshot => (
        this.environment.getShelterAgentByPlaceID(shelterSnapshot.id)
      ))
    }

    const fastestMission = new MissionsService<TransportTaskType, TransportTask>(
      shelterAgents.map(shelterAgent =>
        this.buildRescueMission(shelterAgent)
      )
    ).fastestMission

    const rescueShelterAgent = this.environment.getShelterAgentByPlaceID(
      new TransportMissionService(fastestMission).rescuePlace.id
    )

    const optimalMission = new MissionsService(
      this.environment.helicopterAgents.map(helicopterAgent =>
        helicopterAgent.buildRescueMission(rescueShelterAgent)
      )
    ).fastestMission

    if (optimalMission.agentID === this.id) {
      return optimalMission
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

    const {
      finishedAt,
      finishedIn
    } = new TransportMissionService(beforeMission)

    const helicopterBases = this.environment.baseAgents
      .filter(baseAgent => baseAgent.isHelicopterBase)
      .map(helicopterBaseAgent => helicopterBaseAgent.base)

    const fastestArrivableHelicopterBases = transportService.getFastestArrivablePlaces(finishedIn, helicopterBases)
    const fastestArrivableHelicopterBase = fastestArrivableHelicopterBases[0]

    return this.buildReturnBaseMission(finishedAt, finishedIn, fastestArrivableHelicopterBase)
  }

  buildLatestReturnBaseMission (beforeMission: TransportMission): TransportMission {
    const transportService = this.transportService

    const {
      finishedAt,
      finishedIn
    } = new TransportMissionService(beforeMission)

    const helicopterBases = this.environment.baseAgents
      .filter(baseAgent => baseAgent.isHelicopterBase)
      .map(helicopterBaseAgent => helicopterBaseAgent.base)

    const latestArrivableHelicopterBases = transportService.getLatestArrivablePlaces(finishedIn, helicopterBases)
    const latestArrivableHelicopterBase = latestArrivableHelicopterBases[0]

    return this.buildReturnBaseMission(finishedAt, finishedIn, latestArrivableHelicopterBase)
  }

  buildRescueMission (shelterAgent: ShelterAgent): Mission<TransportTaskType, TransportTask> {
    const tasks: TransportTask[] = []

    const environment = this.environment.clone()
    const transportService = this.transportService
    const { lastMission } = this.scheduleService
    const lastMissionService = new TransportMissionService(lastMission)

    const moveToShelterTask = transportService.buildMoveToPlaceTask(
      lastMissionService.finishedAt,
      lastMissionService.finishedIn,
      shelterAgent.place
    )
    tasks.push(moveToShelterTask)

    const rescueTask = transportService.buildRescueTask(
      shelterAgent.getLandableAt(moveToShelterTask.finishedAt, +config.get('TASK_DURATION_RESCUE')),
      shelterAgent.place,
      Math.min(shelterAgent.injuredsCount, this.helicopter.maxInjuredsCount)
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
    this.submitRescueTask(environment, rescueTask)

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
    this.submitUnloadTask(environment, unloadTask)

    const optimalRefuelBase = environment.baseAgents.filter(baseAgent => baseAgent.isRefuelable).map(refualbeBaseAgent => {
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
      optimalRefuelBase.place
    )
    tasks.push(moveToRefuelableBaseTask)

    const refuelTask = transportService.buildRefuelTask(
      optimalRefuelBase.getLandableAt(moveToRefuelableBaseTask.finishedAt, +config.get('TASK_DURATION_REFUEL')),
      optimalRefuelBase.place
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
    this.submitRefuelTask(environment, refuelTask)

    return builders.missions.transports.rescue(this.id, tasks)
  }

  buildReturnBaseMission (startedAt: Date, startedIn: Place, stayedIn: Place): TransportMission {
    const tasks = []
    const environment = this.environment.clone()
    const { transportService, scheduleService } = this

    const baseAgent = environment.getBaseAgentByPlaceID(stayedIn.id)
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
    this.submitRefuelTask(environment, refuelTask)

    const stayTask = transportService.buildStayTask(
      refuelTask.finishedAt,
      startDateOfNextDay,
      stayedIn
    )
    tasks.push(stayTask)
    this.submitRefuelTask(environment, stayTask)

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
    const finishedAt = new MissionService(readyMission).finishedAt
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
    const missionService = new TransportMissionService(mission)

    missionService.refuelTasks.forEach(refuelTask =>
      this.submitRefuelTask(environment, refuelTask)
    )

    missionService.rescueTasks.forEach(rescueTask =>
      this.submitRescueTask(environment, rescueTask)
    )

    missionService.unloadTasks.forEach(unloadTask =>
      this.submitUnloadTask(environment, unloadTask)
    )

    missionService.stayTasks.forEach(stayTask =>
      this.submitStayTask(environment, stayTask)
    )

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
    const shelterAgent = environment.getBaseAgentByPlaceID(unloadTask.startedIn.id)
    shelterAgent.addMission(
      builders.missions.places.unloadByTransportTaskAndTransport(
        shelterAgent.id,
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

  get transportService (): TransportService {
    return new TransportService(this.transport)
  }

  clone (environment?: Environment): HelicopterAgent {
    return new HelicopterAgent(
      this.id,
      this.transport,
      this.scheduleService.clone(),
      environment || this.environment
    )
  }
}
