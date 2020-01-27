import {
  Mission
} from './missions'
import {
  Task,
  PlaceTaskType,
  PlaceTask,
  TransportTask,
  TransportTaskType
} from './tasks'

export interface Schedule<TT, T extends Task<TT>> {
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  missions: Mission<TT, T>[];
}

export type PlaceSchedule = Schedule<PlaceTaskType, PlaceTask>

export type TransportSchedule = Schedule<TransportTaskType, TransportTask>
