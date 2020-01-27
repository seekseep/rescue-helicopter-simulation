import { getNewID } from '../utilities'
import { PlaceID, Shelter, Base, Position, BaseType } from '../entities'

export const shelter = (
  position: Position,
  maxLandableCount: number,
  requestedInjuredsCount: number,
  id?: PlaceID,
  displayName?: string
): Shelter => {
  id = id || getNewID()
  displayName = displayName || `Shelter #${id}`
  return {
    id,
    displayName,
    position,
    maxLandableCount,
    requestedInjuredsCount
  }
}

export const base = (
  position: Position,
  maxLandableCount: number,
  baseType: BaseType,
  isRefuelable: boolean,
  id?: PlaceID,
  displayName?: string
): Base => {
  id = id || getNewID()
  displayName = displayName || `Base ${id}`
  return {
    id,
    displayName,
    position,
    maxLandableCount,
    isRefuelable,
    baseType
  }
}
