import { GeneralTask, Mission, Schedule, Task } from '../entities'
import * as builders from '../builders'
import * as utils from '../utilities'
import { DAY } from '../constants'
import { ScheduleCache } from '../entities/schedules'

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

  get tasks (): T[] {
    return this.schedule.cache.allTasks
  }

  get freeTasks (): GeneralTask[] {
    return this.schedule.cache.freeTasks
  }

  get finishedTasks (): T[] {
    return this.schedule.cache.finishedTasks
  }

  isActive (date: Date): boolean {
    const { startHours, startMinutes, endHours, endMinutes } = this.schedule

    const start = startHours * 60 + startMinutes
    const time = date.getHours() * 60 + date.getMinutes()
    const end = endHours * 60 + endMinutes

    return start <= time && time <= end
  }

  isWorking (date: Date): boolean {
    return this.getProcessingMissionsCountByDate(date) > 0
  }

  getProcessingMissionsByDate (date: Date): M[] {
    return this.missions.filter(mission => {
      const { duration, startedAt, finishedAt } = mission
      return duration > 0 && startedAt <= date && date <= finishedAt
    })
  }

  getProcessingMissionsCountByDate (date: Date): number {
    return this.getProcessingMissionsByDate(date).length
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

  getTasksByStartedAtTime (startedAtTime: number): T[]|null {
    return this.schedule.cache.startedAtTimeToTasks.get(startedAtTime) || null
  }

  getTasksByFinishedAtTime (finishedAtTime: number): T[]|null {
    return this.schedule.cache.finishedAtTimeToTasks.get(finishedAtTime) || null
  }

  addMission (mission: M, addedAt: Date): void {
    this.missions.push(mission)
    this.updateCacheWithNewMission(mission, addedAt)
  }

  updateCacheWithStartedTask (startedTask: T, cachedAt: Date): void {
    const { cache } = this.schedule
    cache.startedTasks.push(startedTask)
    cache.cachedAt = cachedAt
  }

  updateCacheWithFinishedTask (finishedTask: T, cachedAt: Date): void {
    const { cache } = this.schedule
    cache.finishedTasks.push(finishedTask)
    cache.cachedAt = cachedAt
  }

  updateCacheWithNewMission (newMission: M, cachedAt: Date): void {
    const { cache } = this.schedule

    cache.cachedAt = cachedAt
    cache.lastMission = newMission
    cache.allTasks = [...cache.allTasks, ...newMission.tasks]
    newMission.tasks.forEach(task => {
      const tasks = cache.taskTypeToTasks.get(task.type) || []
      tasks.push(task)
      cache.taskTypeToTasks.set(task.type, tasks)

      const startedAtTime = task.startedAt.getTime()
      cache.startedAtTimeToTasks.set(startedAtTime, [
        ...(cache.startedAtTimeToTasks.get(startedAtTime) || []),
        task
      ])
      cache.points.set(startedAtTime, task.startedAt)

      const finishedAtTime = task.finishedAt.getTime()
      cache.finishedAtTimeToTasks.set(finishedAtTime, [
        ...(cache.finishedAtTimeToTasks.get(finishedAtTime) || []),
        task
      ])
      cache.points.set(finishedAtTime, task.finishedAt)
    })
    cache.freeTasks = this.buildFreeTasks()
  }

  buildFreeTasks (): GeneralTask[] {
    const { parallelMissionsCount } = this.schedule
    const points = Array.from(this.schedule.cache.points.values()).sort((a, b) => a > b ? 1 : -1)

    return points.reduce((tasks: GeneralTask[], current: Date, index: number, points: Date[]): GeneralTask[] => {
      if (index === 0) return tasks

      const prev = points[index - 1]
      if (this.getProcessingMissionsCountByDate(prev) >= parallelMissionsCount) {
        return tasks
      }

      const task = builders.tasks.free(prev, current)
      const lastTask = tasks[tasks.length - 1]
      if (!lastTask || lastTask.finishedAt < task.startedAt) {
        return [...tasks, task]
      }

      const otherTasks = tasks.slice(0, -1)
      const newTask = builders.tasks.free(lastTask.startedAt, task.finishedAt)

      return [...otherTasks, newTask]
    }, [])
  }
}
