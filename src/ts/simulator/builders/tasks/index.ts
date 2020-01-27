import { Task } from '../../entities'

import * as places from './places'
import * as transports from './transports'
import { GeneralTaskType } from '../../entities/tasks'

const free = (startedAt: Date, finishedAt: Date): Task => ({
  type: GeneralTaskType.FREE,
  startedAt,
  finishedAt
})

export {
  free,
  places,
  transports
}
