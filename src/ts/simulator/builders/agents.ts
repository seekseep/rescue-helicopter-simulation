import { BaseAgent, ShelterAgent, HelicopterAgent } from '../agents'
import { getNewID } from '../utilities'

import * as placesBuilder from './places'
import * as transportsBuilder from './transports'
import * as schedulesBuilder from './schedules'
import Environment from '../Environment'
import { AgentID, Position, BaseType, PlaceID } from '../entities'

export const base = (
  base: {
    position: Position;
    maxLandableCount: number;
    baseType: BaseType;
    isRefuelable?: boolean;
    id?: PlaceID;
    displayName?: string;
  },
  environment: Environment,
  id?: AgentID
): BaseAgent => (
  new BaseAgent(
    id || getNewID(),
    placesBuilder.base(
      base.position,
      base.maxLandableCount,
      base.baseType,
      base.isRefuelable,
      base.id,
      base.displayName
    ),
    schedulesBuilder.base(base.maxLandableCount),
    environment
  )
)

export const shelter = (
  shelter: {
    position: Position;
    maxLandableCount: number;
    requestedInjuredsCount: number;
    id?: AgentID;
    displayName?: string;
  },
  environment: Environment,
  id?: AgentID
): ShelterAgent => (
  new ShelterAgent(
    id || getNewID(),
    placesBuilder.shelter(
      shelter.position,
      shelter.maxLandableCount,
      shelter.requestedInjuredsCount,
      shelter.id,
      shelter.displayName
    ),
    schedulesBuilder.shelter(shelter.maxLandableCount),
    environment
  )
)

export const helicopter = (
  helicopter: {
    speed: number;
    maxInjuredsCount: number;
    maxContinuousFlightTime: number;
    useRescueRate: boolean;
    id?: AgentID;
    displayName?: string;
    schedule: {
      startHours: number;
      startMinutes: number;
      endHours: number;
      endMinutes: number;
    };
  },
  environment: Environment,
  id?: AgentID
): HelicopterAgent => (
  new HelicopterAgent(
    id || getNewID(),
    transportsBuilder.helicopter(
      helicopter.speed,
      helicopter.maxInjuredsCount,
      helicopter.maxContinuousFlightTime,
      helicopter.useRescueRate,
      helicopter.id,
      helicopter.displayName
    ),
    schedulesBuilder.transport(
      helicopter.schedule.startHours,
      helicopter.schedule.startMinutes,
      helicopter.schedule.endHours,
      helicopter.schedule.endMinutes
    ),
    environment
  )
)
