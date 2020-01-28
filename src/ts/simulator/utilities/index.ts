import { MINUTE } from '../constants'
import { getDistance } from 'geolib'
import { GeolibInputCoordinates } from 'geolib/es/types'

const buildGetNewID = (): () => number => {
  let _id = 1
  return (): number => _id++
}

export const getNewID = buildGetNewID()

export const distance = (fromPosition: GeolibInputCoordinates, toPosition: GeolibInputCoordinates): number => (
  getDistance(
    fromPosition,
    toPosition
  )
)

export const ceilTime = (time: number): number => {
  return Math.ceil(time / MINUTE) * MINUTE
}

export const moveTime = (fromPosition: GeolibInputCoordinates, toPosition: GeolibInputCoordinates, speed: number): number => (
  Math.ceil(distance(fromPosition, toPosition) / speed)
)

export const dateToString = (date: Date): string => (
  `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
)

export const addDateAndTime = (date: Date, time: number): Date => (
  new Date(date.getTime() + time)
)

export const diffDates = (fromDate: Date, toDate: Date): number => (
  toDate.getTime() - fromDate.getTime()
)

export const equalDate = (a: Date, b: Date): boolean => {
  return a.getTime() === b.getTime()
}

export const dateFromDateAndHoursAndMinutes = (date: Date, hours: number, minutes: number): Date => {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return new Date(
    `${y}/${m}/${d} ${hours}:${minutes}:00`
  )
}

export const messagesToString = (messages, depth: number): string => {
  return messages.map(message => {
    const indent = Array.from({ length: depth }).map(() => '\t').join('')
    if (Array.isArray(message)) {
      return messagesToString(message, depth + 1)
    } else {
      return `${indent}${message}`
    }
  }).join('\n')
}
