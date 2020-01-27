import { Place } from '../entities'

export default class PlacesService <T extends Place> {
  places: T[]
  constructor (places: T[]) {
    this.places = places
  }
}
