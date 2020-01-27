import { Helicopter, TransportID } from '../entities'
import { getNewID } from '../utilities'

export const helicopter = (
  speed: number,
  maxInjuredsCount: number,
  useRescueRate = false,
  id?: TransportID,
  displayName?: string
): Helicopter => {
  id = id || getNewID()
  return {
    id,
    displayName: displayName || `Helicopter#${id}`,
    speed,
    maxInjuredsCount,
    useRescueRate
  }
}
