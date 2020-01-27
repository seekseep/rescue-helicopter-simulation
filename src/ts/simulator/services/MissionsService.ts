import { Mission, Task } from '../entities'
import MissionService from './MissionService'

export default class MissionsService<TT, T extends Task<TT>> {
  missions: Mission<TT, T>[];
  constructor (missions: Mission<TT, T>[]) {
    this.missions = missions
  }

  get fastestMission (): Mission<TT, T> {
    return this.missions.reduce((fastestMission, mission) =>
      new MissionService(fastestMission).finishedAt < new MissionService(mission).finishedAt
        ? fastestMission : mission
    )
  }

  getFinishedMissions (date: Date): Mission<TT, T>[] {
    return this.missions.filter(mission =>
      new MissionService(mission).finishedAt <= date
    )
  }

  clone (): Mission<TT, T>[] {
    return this.missions.map(mission => new MissionService(mission).clone())
  }
}
