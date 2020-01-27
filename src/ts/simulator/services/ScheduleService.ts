import { GeneralTask, Mission, Schedule, Task } from '../entities'
import * as builders from '../builders'
import * as utils from '../utilities'
import { DAY } from '../constants'
import MissionService from './MissionService'
import MissionsService from './MissionsService'

export default class ScheduleService<TT, T extends Task<TT>> {
  schedule: Schedule<TT, T>

  constructor (schedule: Schedule<TT, T>) {
    this.schedule = schedule
  }

  get missions (): Mission<TT, T>[] {
    return this.schedule.missions
  }

  get lastMission (): Mission<TT, T> {
    return this.missions[this.missions.length - 1]
  }

  get tasks (): T[] {
    return this.missions.reduce((a, b) => [...a, ...b.tasks], [])
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

  getProcessingMissionsByDate (date: Date): Mission<TT, T>[] {
    return this.schedule.missions.filter(mission => {
      const { time, startedAt, finishedAt } = new MissionService(mission)
      return time > 0 && startedAt <= date && date <= finishedAt
    })
  }

  getProcessingMissionsCountByDate (date: Date): number {
    return this.getProcessingMissionsByDate(date).length
  }

  getLastTaskIndex (taskType: TT): number {
    return this.tasks.length - this.tasks.reverse().findIndex(task => task.type === taskType) - 1
  }

  getFinishedTasks (date: Date): T[] {
    return this.tasks.filter(task => {
      return task.finishedAt < date
    })
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

  getFreeTasks (maxParallelMissionsCount = 1, fromDate?: Date): GeneralTask[] {
    const missions = fromDate ? (
      this.missions.filter(mission => fromDate < new MissionService(mission).finishedAt)
    ) : this.missions

    const points = Object.keys(missions.reduce((points, mission) => {
      const missionService = new MissionService(mission)
      points[missionService.startedAt.getTime()] = true
      points[missionService.finishedAt.getTime()] = true
      return points
    }, {})).map(key => new Date(+key)).sort((a, b) => a.getTime() - b.getTime())

    return points.reduce((tasks: GeneralTask[], current: Date, index: number, points: Date[]): GeneralTask[] => {
      if (index === 0) return tasks

      const prev = points[index - 1]
      if (this.getProcessingMissionsCountByDate(prev) >= maxParallelMissionsCount) {
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

  addMission (mission: Mission<TT, T>): void {
    this.missions.push(mission)
  }

  clone (): Schedule<TT, T> {
    const { startHours, startMinutes, endHours, endMinutes, missions } = this.schedule
    return {
      startHours,
      startMinutes,
      endHours,
      endMinutes,
      missions: new MissionsService(missions).clone()
    }
  }
}
