import {
  Mission,
  PlaceMission,
  TransportMission
} from './missions'
import {
  Task,
  PlaceTaskType,
  PlaceTask,
  TransportTask,
  TransportTaskType,
  GeneralTask
} from './tasks'

export interface ScheduleCache <TT, T extends Task<TT>, M extends Mission<TT, T>> {
  lastMission: M;
  freeTasks: GeneralTask[];
  taskTypeToTasks: Map<TT, T[]>;
  finishedAtTimeToTasks: Map<number, Map<number, T>>;
  startedAtTimeToMissions: Map<number, Map<number, M>>;
  finishedAtTimeToMissions: Map<number, Map<number, M>>;
  activeMissions: Map<number, M>;
  notFinishedMissions: Map<number, M>;
  notPassedMissionPoints: Map<number, Date>;
}

export type PlaceScheduleCache = {

} & ScheduleCache<PlaceTaskType, PlaceTask, PlaceMission>

export type ShelterScheduleCache = {
  rescuedInjuredsCount: number;
  willRescuedInjuredsCount: number;
} & PlaceScheduleCache

export type BaseScheduleCache = {
  injuredsCount: number;
} & PlaceScheduleCache

export type TransportScheduleCache = {
  rescuedInjuredsCount: number;
} & ScheduleCache<TransportTaskType, TransportTask, TransportMission>

export interface Schedule<TT, T extends Task<TT>, M extends Mission<TT, T>, C extends ScheduleCache<TT, T, M>> {
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  parallelMissionsCount: number;
  missions: M[];
  cache: C;
}

export type PlaceSchedule = Schedule<PlaceTaskType, PlaceTask, PlaceMission, PlaceScheduleCache>

export type ShelterSchedule = Schedule<PlaceTaskType, PlaceTask, PlaceMission, ShelterScheduleCache>

export type BaseSchedule = Schedule<PlaceTaskType, PlaceTask, PlaceMission, BaseScheduleCache>

export type TransportSchedule = Schedule<TransportTaskType, TransportTask, TransportMission, TransportScheduleCache>
