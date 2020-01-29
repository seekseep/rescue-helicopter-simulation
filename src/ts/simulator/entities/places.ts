import { Position } from './positions'

export type PlaceID = number

export interface Place {
  id: PlaceID;
  position: Position;
  displayName: string;
  maxLandableCount: number;
}

export enum BaseType {
  HELICOPTER = 'BASE_TYPE/HELICOPTER',
  FORWARD = 'BASE_TYPE/FORWARD'
}

export type Base = {
  baseType: BaseType;
  isRefuelable: boolean;
} & Place

export type Shelter = {
  requestedInjuredsCount: number;
} & Place
