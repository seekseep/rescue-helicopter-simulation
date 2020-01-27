import {
  TASK_DURATION_RESCUE,
  TASK_DURATION_REFUEL,
  TASK_DURATION_UNLOAD
} from '../constants'

type ConfigValue = number|string

class Config {
  values: Map<string, ConfigValue>
  constructor () {
    const values = new Map()

    values.set('TASK_DURATION_RESCUE', TASK_DURATION_RESCUE)
    values.set('TASK_DURATION_REFUEL', TASK_DURATION_REFUEL)
    values.set('TASK_DURATION_UNLOAD', TASK_DURATION_UNLOAD)

    this.values = values
  }

  set (key: string, value: ConfigValue): void {
    this.values.set(key, value)
  }

  get (key: string): ConfigValue {
    return this.values.get(key)
  }
}

export default new Config()
