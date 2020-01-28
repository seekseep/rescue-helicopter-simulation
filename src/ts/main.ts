import Simulator from './simulator/Simulator'
import { Project, BaseType } from './simulator/entities'

const defaultValues = {
  project: {
    startedAt: '2020/01/01 00:00:00',
    finishedAt: '2020/01/03 23:59:00'
  },
  tasks: {
    rescue: 30 * 60 * 1000,
    refuel: 20 * 60 * 1000,
    unload: 5 * 60 * 1000
  },
  helicopterConfig: {
    useRescueRate: true,
    schedule: {
      startHours: 6,
      startMinutes: 0,
      endHours: 18,
      endMinutes: 0
    }
  },
  bases: [{
    displayName: '高知空港',
    position: { latitude: 33.5466513, longitude: 133.671616 },
    isRefuelable: true,
    baseType: 'HELICOPTER',
    maxLandableCount: 2,
    helicopters: [{
      speed: 12000000,
      maxInjuredsCount: 4
    }, {
      speed: 12000000,
      maxInjuredsCount: 4
    }]
  }, {
    displayName: '南国病院',
    position: { latitude: 33.5684309, longitude: 133.6325643 },
    isRefuelable: false,
    maxLandableCount: 1,
    baseType: 'FORWARD',
    helicopters: []
  }],
  shelters: [{
    displayName: '日章小学校',
    maxLandableCount: 1,
    requestedInjuredsCount: 1000,
    position: { latitude: 33.5648524, longitude: 133.6882191 }
  }, {
    displayName: '北陵中学校',
    maxLandableCount: 1,
    requestedInjuredsCount: 5000,
    position: { latitude: 33.6050257, longitude: 133.6264054 }
  }]
}

function showErrorDialog (message: string): void{
  const errorDialogMessage: HTMLElement = document.querySelector('#errorDialogMessage')
  errorDialogMessage.innerHTML = message

  const errorDialog: HTMLElement = document.querySelector('#errorDialog')
  errorDialog.classList.remove('hidden')
}

function hideErrorDialog (): void {
  const errorDialogMessage: HTMLElement = document.querySelector('#errorDialogMessage')
  errorDialogMessage.innerHTML = ''

  const errorDialog: HTMLElement = document.querySelector('#errorDialog')
  errorDialog.classList.add('hidden')
}

function setProgress (progress: number): void {
  const progressBar: HTMLElement = document.querySelector('#progressBar')
  const progressText: HTMLElement = document.querySelector('#progressText')
  progressBar.style.width = (progress * 100) + '%'
  progressText.innerHTML = (progress * 100).toFixed(2)
}

function parseParameterJSON (json: string): {project; bases: []; shelters: []; tasks} {
  const row = JSON.parse(json)

  const project: Project = {
    startedAt: new Date(row.project.startedAt),
    finishedAt: new Date(row.project.finishedAt)
  }

  const helicopterConfig = {
    useRescueRate: row.helicopterConfig.useRescueRate,
    schedule: {
      startHours: row.helicopterConfig.schedule.startHours,
      startMinutes: row.helicopterConfig.schedule.startMinutes,
      endHours: row.helicopterConfig.schedule.endHours,
      endMinutes: row.helicopterConfig.schedule.endMinutes
    }
  }

  const bases = row.bases.map(base => ({
    displayName: base.displayName,
    position: {
      latitude: base.position.latitude,
      longitude: base.position.longitude
    },
    isRefuelable: base.isRefuelable,
    baseType: base.baseType === 'HELICOPTER' ? BaseType.HELICOPTER : BaseType.FORWARD,
    maxLandableCount: base.maxLandableCount,
    helicopters: base.helicopters.map(helicopter => ({
      speed: helicopter.speed,
      maxInjuredsCount: helicopter.maxInjuredsCount,
      useRescueRate: helicopter.useRescueRate !== undefined ? helicopter.useRescueRate : helicopterConfig.useRescueRate,
      schedule: helicopter.schedule ? {
        startHours: helicopter.schedule.startHours,
        startMinutes: helicopter.schedule.startMinutes,
        endHours: helicopter.schedule.endHours,
        endMinutes: helicopter.schedule.endMinutes
      } : helicopterConfig.schedule
    }))
  }))

  const shelters = row.shelters.map(shelter => ({
    displayName: shelter.displayName,
    maxLandableCount: shelter.maxLandableCount,
    requestedInjuredsCount: shelter.requestedInjuredsCount,
    position: {
      latitude: shelter.position.latitude,
      longitude: shelter.position.longitude
    }
  }))

  let tasks
  if (row.tasks) {
    tasks = {}
    if (row.tasks.refuel) tasks.refuel = row.tasks.refuel
    if (row.tasks.rescue) tasks.rescue = row.tasks.rescue
    if (row.tasks.unload) tasks.unload = row.tasks.unload
  }

  return {
    project, bases, shelters, tasks
  }
}

async function simulate (project, bases, shelters, tasks): Promise<string> {
  const simulator = new Simulator()
  simulator.setup(project, bases, shelters, tasks)

  setProgress(0)
  await simulator.start((progress) => setProgress(progress))
  setProgress(1)

  const result = simulator.getResult()
  return result
}

async function submitHandler (event: Event): Promise<void> {
  event.preventDefault()

  const result: HTMLTextAreaElement = document.querySelector('#result')
  const parameterInput: HTMLTextAreaElement = document.querySelector('#parameterInput')

  try {
    const parameterJSON = parameterInput.value
    const { project, bases, shelters, tasks } = parseParameterJSON(parameterJSON)
    result.value = await simulate(project, bases, shelters, tasks)
  } catch (e) {
    showErrorDialog(e.toString())
    throw e
  }
}

function main (): void {
  const parameterInput: HTMLTextAreaElement = document.querySelector('#parameterInput')
  parameterInput.value = JSON.stringify(defaultValues, null, 4)

  const parameterForm: HTMLFontElement = document.querySelector('#parameterForm')
  parameterForm.addEventListener('submit', submitHandler)

  const closeErrorDialog: HTMLButtonElement = document.querySelector('#closeErrorDialog')
  closeErrorDialog.addEventListener('click', hideErrorDialog)
}

window.addEventListener('load', main)
