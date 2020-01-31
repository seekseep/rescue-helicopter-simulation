import { MINUTE } from '../constants'
import { getDistance } from 'geolib'
import { GeolibInputCoordinates } from 'geolib/es/types'
import { Task, Mission } from '../entities'

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

export const moveTime = (fromPosition: GeolibInputCoordinates, toPosition: GeolibInputCoordinates, speed: number): number => {
  return distance(fromPosition, toPosition) / speed * MINUTE
}

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

export const placesPairID = (a: number, b: number): string => (
  a < b ? `${a}_${b}` : `${b}_${a}`
)

export const copyTasksArray = <TT, T extends Task<TT>>(tasksArray: T[]): T[] => (
  [...tasksArray]
)

export const copyMissionsArray = <TT, T extends Task<TT>, M extends Mission<TT, T>>(missionsArray: M[]):M[] => (
  [...missionsArray]
)

export const copyTaskTypeToTasksMap = <TT, T extends Task<TT>>(taskTypeToTasksMap: Map<TT, T[]>):Map<TT, T[]> => {
  const map = new Map()
  taskTypeToTasksMap.forEach((tasks, taskType) => {
    map.set(taskType, copyTasksArray(tasks))
  })
  return map
}

export const copyNumberToTasksMap = <
  TT,
  T extends Task<TT>
>(numberToTasksMap: Map<number, T[]>) : Map<number, Map<number, T>> => {
  const map = new Map()
  numberToTasksMap.forEach((tasks, number) => {
    const m = new Map()
    map.set(number, m)
    tasks.forEach((task, id) => {
      m.set(id, task)
    })
  })
  return map
}

export const copyNumberToMissionsMap = <
  TT,
  T extends Task<TT>,
  M extends Mission<TT, T>
>(numberToMissionsMap: Map<number, Map<number, M>>) : Map<number, Map<number, M>> => {
  const map = new Map()
  numberToMissionsMap.forEach((missions, number) => {
    const m = new Map()
    map.set(number, m)
    missions.forEach((mission, id) => {
      m.set(id, mission)
    })
  })
  return map
}


export const copyNumberToMissionMap = <
  TT,
  T extends Task<TT>,
  M extends Mission<TT, T>
>(numberToMission: Map<number, M>) : Map<number, M> => {
  const map = new Map()
  numberToMission.forEach((mission, number) => {
    map.set(number, mission)
  })
  return map
}

export const copyNumberToDateMap = (numberToDate: Map<number, Date>) : Map<number, Date> => {
  const map = new Map()
  numberToDate.forEach((date, number) => {
    map.set(number, date)
  })
  return map
}