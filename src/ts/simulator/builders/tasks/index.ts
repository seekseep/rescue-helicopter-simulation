import { GeneralTaskType, GeneralTask } from '../../entities'
import * as utils from '../../utilities'

import * as places from './places'
import * as transports from './transports'

const free = (startedAt: Date, finishedAt: Date): GeneralTask => ({
  type: GeneralTaskType.FREE,
  startedAt,
  finishedAt,
  duration: utils.diffDates(startedAt, finishedAt)
})

export {
  free,
  places,
  transports
}
