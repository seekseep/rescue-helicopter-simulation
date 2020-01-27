import { ShelterSnapshot } from '../entities'

export default class ShelterSnapshotsService {
  shelterSnapshots: ShelterSnapshot[]

  constructor (shelterSnapshots: ShelterSnapshot[]) {
    this.shelterSnapshots = shelterSnapshots
  }

  get minRescueRateShelterSnapshots (): ShelterSnapshot[] {
    const rescueRateMap = new Map<number, ShelterSnapshot[]>()
    this.shelterSnapshots.forEach(shelterSnapshot => {
      const { rescueRate } = shelterSnapshot
      rescueRateMap.set(
        rescueRate,
        [...(rescueRateMap.get(rescueRate) || []), shelterSnapshot]
      )
    })
    const minRescueRate = Array.from(rescueRateMap.keys()).reduce((a, b) => Math.min(a, b))
    return rescueRateMap.get(minRescueRate)
  }
}
