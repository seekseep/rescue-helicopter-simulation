import {
  BaseSchedule,
  BaseScheduleCache,
  Mission,
  PlaceMission,
  PlaceSchedule,
  PlaceScheduleCache,
  PlaceTask,
  PlaceTaskType,
  ScheduleCache,
  ShelterSchedule,
  ShelterScheduleCache,
  Task,
  TransportMission,
  TransportSchedule,
  TransportScheduleCache,
  TransportTask,
  TransportTaskType,
  GeneralTaskType
} from '../entities'

export const defultSchduleCache = <TT, T extends Task<TT>, M extends Mission<TT, T>>(): ScheduleCache<TT, T, M> => ({
  lastMission: null,
  freeTasks: [],
  taskTypeToTasks: new Map(),
  finishedAtTimeToTasks: new Map(),
  notPassedMissionPoints: new Map(),
  startedAtTimeToMissions: new Map(),
  finishedAtTimeToMissions: new Map(),
  activeMissions: new Map(),
  notFinishedMissions: new Map(),
})

export const defaultTransportScheduleCache = (): TransportScheduleCache => ({
  ...defultSchduleCache<TransportTaskType, TransportTask, TransportMission>(),
  rescuedInjuredsCount: 0
})

export const defaultPlaceScheduleCache = (): PlaceScheduleCache => ({
  ...defultSchduleCache<PlaceTaskType, PlaceTask, PlaceMission>(),
  injuredsCount: 0
})

export const defaultShelterScheduleCache = (): ShelterScheduleCache => ({
  ...defaultPlaceScheduleCache(),
  rescuedInjuredsCount: 0,
  willRescuedInjuredsCount: 0
})

export const defaultBaseScheduleCache = (): BaseScheduleCache => ({
  ...defaultPlaceScheduleCache()
})

export const transport = (startHours: number, startMinutes: number, endHours: number, endMinutes: number, cache?: TransportScheduleCache): TransportSchedule => ({
  startHours,
  startMinutes,
  endHours,
  endMinutes,
  parallelMissionsCount: 1,
  missions: [],
  cache: cache || defaultTransportScheduleCache()
})

export const place = (parallelMissionsCount: number, cache?: PlaceScheduleCache): PlaceSchedule => ({
  startHours: 0,
  startMinutes: 0,
  endHours: 23,
  endMinutes: 59,
  parallelMissionsCount,
  missions: [],
  cache: cache || defaultPlaceScheduleCache()
})

export const shelter = (parallelMissionsCount: number, cache?: ShelterScheduleCache): ShelterSchedule => ({
  startHours: 0,
  startMinutes: 0,
  endHours: 23,
  endMinutes: 59,
  parallelMissionsCount,
  missions: [],
  cache: cache || defaultShelterScheduleCache()
})

export const base = (parallelMissionsCount: number, cache?: BaseScheduleCache): BaseSchedule => ({
  startHours: 0,
  startMinutes: 0,
  endHours: 23,
  endMinutes: 59,
  parallelMissionsCount,
  missions: [],
  cache: cache || defaultBaseScheduleCache()
})
