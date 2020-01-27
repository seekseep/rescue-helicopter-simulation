import {
  PlaceTask,
  PlaceTaskType,
  Task,
  TransportTask,
  TransportTaskType
} from './tasks'

export interface Mission<TT, T extends Task<TT>> {
  agentID: number;
  displayName: string;
  tasks: T[];
}

export type PlaceMission = Mission<PlaceTaskType, PlaceTask>

export type TransportMission = Mission<TransportTaskType, TransportTask>
