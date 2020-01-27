import { TransportSchedule, PlaceSchedule } from '../entities'

export const transport = (startHours: number, startMinutes: number, endHours: number, endMinutes: number): TransportSchedule => ({
  startHours,
  startMinutes,
  endHours,
  endMinutes,
  missions: []
})

export const place = (): PlaceSchedule => ({
  startHours: 0,
  startMinutes: 0,
  endHours: 23,
  endMinutes: 59,
  missions: []
})
