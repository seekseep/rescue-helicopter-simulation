import {
  PlaceTask,
  PlaceTaskType,
  Task,
  TransportTask,
  TransportTaskType
} from './tasks'
import { Place } from './places'

export interface Mission<TT, T extends Task<TT>> {
  agentID: number;
  displayName: string;
  startedAt: Date;
  finishedAt: Date;
  duration: number;
  tasks: T[];
}

export type PlaceMission = Mission<PlaceTaskType, PlaceTask>

export type TransportMission = {
  startedIn: Place;
  finishedIn: Place;
} & Mission<TransportTaskType, TransportTask>
