import { GeneralTask, Mission, Schedule, Task } from '../entities'
import * as builders from '../builders'
import * as utils from '../utilities'
import { DAY, MINUTE } from '../constants'
import { ScheduleCache } from '../entities/schedules'
import { mission } from '../builders/missions'

export default class ScheduleService<TT, T extends Task<TT>, M extends Mission<TT, T>, C extends ScheduleCache<TT, T, M>> {
  schedule: Schedule<TT, T, M, C>

  constructor (schedule: Schedule<TT, T, M, C>) {
    this.schedule = schedule
  }

  get missions (): M[] {
    return this.schedule.missions
  }

  get lastMission (): M {
    return this.schedule.cache.lastMission
  }

  get freeTasks (): GeneralTask[] {
    return this.schedule.cache.freeTasks
  }

  get isWorking (): boolean {
    return this.schedule.cache.activeMissions.size >= this.schedule.parallelMissionsCount
  }

  isActive (date: Date): boolean {
    const { startHours, startMinutes, endHours, endMinutes } = this.schedule

    const start = startHours * 60 + startMinutes
    const time = date.getHours() * 60 + date.getMinutes()
    const end = endHours * 60 + endMinutes

    return start <= time && time <= end
  }

  getActiveMissionsCount (missions:M[], date: Date): number {
    return missions.reduce((count, {duration, startedAt, finishedAt}) => {
      return (duration > 0 && startedAt <= date && date < finishedAt) ? count + 1 : count
    }, 0)
  }

  getStartDate (current: Date): Date {
    const { startHours, startMinutes } = this.schedule
    return utils.dateFromDateAndHoursAndMinutes(current, startHours, startMinutes)
  }

  getFinishDate (current: Date): Date {
    const { endHours, endMinutes } = this.schedule
    return utils.dateFromDateAndHoursAndMinutes(current, endHours, endMinutes)
  }

  getStartDateOfNextDay (current: Date): Date {
    const nextDate = utils.addDateAndTime(current, DAY)
    const { startHours, startMinutes } = this.schedule
    return utils.dateFromDateAndHoursAndMinutes(nextDate, startHours, startMinutes)
  }

  getTasksByFinishedAtTime (finishedAtTime: number): Map<number, T>|null {
    return this.schedule.cache.finishedAtTimeToTasks.get(finishedAtTime) || null
  }

  getMissionsByStartedAtTime (startedAtTime: number): Map<number, M>|null {
    return this.schedule.cache.startedAtTimeToMissions.get(startedAtTime) || null
  }

  getMissionsByFinishedAtTime (finishedAtTime: number): Map<number, M>|null {
    return this.schedule.cache.finishedAtTimeToMissions.get(finishedAtTime) || null
  }

  addMission (mission: M, current: Date): void {
    if (mission.startedAt < current) {
      console.warn('invalid mission', mission)
      debugger;
    }
    this.missions.push(mission)
    this.updateCacheWithNewMission(mission, current)

    if (utils.equalDate(mission.startedAt, current)) {
      this.updateCacheWithStartedMission(mission)

      mission.tasks.forEach(task => {
        if (utils.equalDate(task.finishedAt, current)) {
          this.updateCacheWithFinishedTask(task)
        }
      })
    }

    if (utils.equalDate(mission.finishedAt, current)) {
      this.updateCacheWithFinishedMission(mission)
    }
  }

  updateCacheWithFinishedTask (finishedTask: T): void {
    // do nothing
  }

  updateCacheWithStartedMission (startedMission: M): void {
    this.schedule.cache.activeMissions.set(startedMission.id, startedMission)
  }

  updateCacheWithFinishedMission (finishedMission: M): void {
    this.schedule.cache.activeMissions.delete(finishedMission.id)
    this.schedule.cache.notFinishedMissions.delete(finishedMission.id)
  }

  updateCacheWithNewMission (mission: M, current: Date): void {
    const { cache } = this.schedule
    cache.lastMission = mission

    {
      const startedAtTime = mission.startedAt.getTime()
      if (!cache.startedAtTimeToMissions.has(startedAtTime)) {
        cache.startedAtTimeToMissions.set(startedAtTime, new Map())
      }
      cache.startedAtTimeToMissions.get(startedAtTime).set(mission.id, mission)
      cache.notPassedMissionPoints.set(startedAtTime, mission.startedAt)

      const finishedAtTime = mission.finishedAt.getTime()
      if (!cache.finishedAtTimeToMissions.has(finishedAtTime)) {
        cache.finishedAtTimeToMissions.set(finishedAtTime, new Map())
      }
      cache.finishedAtTimeToMissions.get(finishedAtTime).set(mission.id, mission)
      cache.notPassedMissionPoints.set(finishedAtTime, mission.finishedAt)
    }

    mission.tasks.forEach(task => {
      const tasks = cache.taskTypeToTasks.get(task.type) || []
      tasks.push(task)
      cache.taskTypeToTasks.set(task.type, tasks)

      const finishedAtTime = task.finishedAt.getTime()
      if (!cache.finishedAtTimeToTasks.has(finishedAtTime)) {
        cache.finishedAtTimeToTasks.set(finishedAtTime, new Map())
      }
      cache.finishedAtTimeToTasks.get(finishedAtTime).set(task.id, task)
    })

    this.schedule.cache.notFinishedMissions.set(mission.id, mission)

    cache.freeTasks = this.buildFreeTasks(current)
  }

  updateCacheWithCurrent(current: Date) {
    const prev = current.getTime() - MINUTE
    if (this.schedule.cache.notPassedMissionPoints.has(prev)) {
      this.schedule.cache.notPassedMissionPoints.delete(prev)
    }
    const currentTime = current.getTime()
    const finishedTasks = this.getTasksByFinishedAtTime(currentTime)
    if (finishedTasks) {
      finishedTasks.forEach(finishedTask => {
        this.updateCacheWithFinishedTask(finishedTask)
      })
    }
    const startedMissions = this.getMissionsByStartedAtTime(currentTime)
    if (startedMissions) {
      startedMissions.forEach(startedMission => {
        this.updateCacheWithStartedMission(startedMission)
      })
    }
    const finishedMissions = this.getMissionsByFinishedAtTime(currentTime)
    if (finishedMissions) {
      finishedMissions.forEach(finishedMission => {
        this.updateCacheWithFinishedMission(finishedMission)
      })
    }
  }

  buildFreeTasks (current: Date): GeneralTask[] {
    const { parallelMissionsCount } = this.schedule

    const notFinishedMissions = Array.from(this.schedule.cache.notFinishedMissions.values())
    const points = [current, ...Array.from(this.schedule.cache.notPassedMissionPoints.values())].sort((a, b) => a > b ? 1 : -1)

    const freeTasks = points.reduce((tasks: GeneralTask[], current: Date, index: number, points: Date[]): GeneralTask[] => {
      if(index === 0) return tasks

      const prev = points[index - 1]
      if (this.getActiveMissionsCount(notFinishedMissions, prev) >= parallelMissionsCount) {
        return tasks
      }

      const lastTask = tasks.splice(-1, 1)[0]
      const task = builders.tasks.free(prev, current)
      if (!lastTask) return [...tasks, task]

      if (lastTask.finishedAt < task.startedAt) return [...tasks, lastTask, task]

      const unionedTask = builders.tasks.free(lastTask.startedAt, task.finishedAt)
      return [...tasks, unionedTask]
    }, [])

    return freeTasks
  }
}
