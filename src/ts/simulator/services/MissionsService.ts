import { Mission, Task } from '../entities'

export default class MissionsService<TT, T extends Task<TT>, M extends Mission<TT, T>> {
  missions: M[];
  constructor (missions: M[]) {
    this.missions = missions
  }

  get fastestMission (): M {
    return this.missions.length > 1 ? this.missions.reduce((fastestMission, mission) =>
      fastestMission.finishedAt < mission.finishedAt
        ? fastestMission : mission
    ) : this.missions[0]
  }

  getFinishedMissions (date: Date): M[] {
    return this.missions.filter(mission => mission.finishedAt <= date)
  }
}
