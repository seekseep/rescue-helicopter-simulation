import { Mission, Task } from '../entities'

export default class MissionsService<TT, T extends Task<TT>, M extends Mission<TT, T>> {
  missions: M[];
  constructor (missions: M[]) {
    this.missions = missions
  }

  get fastestMission (): M {
    return this.missions.reduce((fastest, mission) => {
      return fastest.finishedAt < mission.finishedAt ? fastest : mission
    })
  }

  get fastestMissions (): Map<number, M> {
    const timeToMissions = new Map<number, Map<number, M>>()
    let fastestTime = null
    this.missions.forEach(mission => {
      const time = mission.finishedAt.getTime()
      if(!timeToMissions.has(time)) timeToMissions.set(time, new Map())
      const map = timeToMissions.get(time)
      map.set(mission.agentID, mission)
      fastestTime = fastestTime === null ? time : Math.min(fastestTime, time)
    })
    return timeToMissions.get(fastestTime)
  }
}
