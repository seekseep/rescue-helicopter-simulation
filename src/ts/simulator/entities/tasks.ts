import { Transport } from './transports'
import { Place } from './places'

export enum GeneralTaskType {
  FREE = 'TASK_TYPE/FREE'
}

export enum TransportTaskType {
  MOVE = 'TASK_TYPE/TRANSPORT/MOVE',
  WAIT = 'TASK_TYPE/TRANSPORT/WAIT',
  RESCUE = 'TASK_TYPE/TRANSPORT/RESCUE',
  UNLOAD = 'TASK_TYPE/TRANSPORT/UNLOAD',
  REFUEL = 'TASK_TYPE/TRANSPORT/REFUEL',
  STAY = 'TASK_TYPE/TRANSPORT/STAY'
}

export enum PlaceTaskType {
  RESCUE = 'TASK_TYPE/PLACE/RESCUE',
  UNLOAD = 'TASK_TYPE/PLACE/UNLOAD',
  REFUEL = 'TASK_TYPE/PLACE/REFUEL',
  HOLD = 'TASK_TYPE/PLACE/HOLD',
}

export interface Task<TT> {
  type: TT;
  startedAt: Date;
  finishedAt: Date;
  duration: number;
}

export type GeneralTask = Task<GeneralTaskType>

export type TransportTask = {
  startedIn: Place;
  finishedIn: Place;
  injuredsCount: number;
  isRefueled: boolean;
} & Task<TransportTaskType>

export type PlaceTask = {
  transport: Transport;
  injuredsCount: number;
} & Task<PlaceTaskType>

export type TaskTyep = GeneralTaskType | TransportTaskType | PlaceTaskType
