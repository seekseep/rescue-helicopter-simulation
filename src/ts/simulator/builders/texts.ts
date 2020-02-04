import { TaskType, TransportTaskType, PlaceTaskType, Project } from '../entities'
import * as utils from '../utilities'
import Environment from '../Environment'
import { MINUTE } from '../constants'

export const taskTypeToLabel = (taskType: TaskType): string => {
  switch (taskType) {
    case PlaceTaskType.HOLD:
    case TransportTaskType.STAY: return '滞在'
    case TransportTaskType.REFUEL:
    case PlaceTaskType.REFUEL: return '給油'
    case TransportTaskType.RESCUE:
    case PlaceTaskType.RESCUE: return '救助'
    case PlaceTaskType.UNLOAD: return '受入'
    case TransportTaskType.MOVE: return '移動'
    case TransportTaskType.WAIT: return '待機'
    case TransportTaskType.UNLOAD: return '降機'
    default: return '不明'
  }
}

export const result = (project: Project, environment: Environment): string => {
  const { shelterAgents, baseAgents, helicopterAgents } = environment

  const { allRequestedInjuredsCount, allRescuedInjuredsCount } = shelterAgents.reduce(({ allRequestedInjuredsCount, allRescuedInjuredsCount },{ rescuedInjuredsCount, requestedInjuredsCount }) => {
    return {
      allRequestedInjuredsCount: allRequestedInjuredsCount + requestedInjuredsCount,
      allRescuedInjuredsCount: allRescuedInjuredsCount + rescuedInjuredsCount,
    }
  }, {
    allRequestedInjuredsCount: 0,
    allRescuedInjuredsCount: 0
  } )

  return utils.messagesToString([
    '概要',
    [
      'プロジェクト',
      [
        `開始日時: ${project.startedAt.toLocaleString()}`,
        `終了日時: ${project.finishedAt.toLocaleString()}`,
        `要請救助者数: ${allRequestedInjuredsCount}`,
        `救助済み: ${allRescuedInjuredsCount}`,
      ],
      '被災地',
      shelterAgents.map(({ displayName, injuredsCount, rescuedInjuredsCount, requestedInjuredsCount, rescueRate }) => ([
        displayName,
        [
          `救助済み: ${rescuedInjuredsCount}`,
        ]
      ])),
      'ヘリコプター',
      helicopterAgents.map(({ displayName, rescuedInjuredsCount }) => ([
        displayName,
        [
          `救助済み: ${rescuedInjuredsCount}`,
        ]
      ]),
    ],
    'ヘリコプター',
    helicopterAgents.map(({ displayName, missions, rescuedInjuredsCount }) => (
      [
        displayName,
        `救助済み負傷者数: ${rescuedInjuredsCount}`,
        missions.map(mission => {
          const { startedAt, startedIn, finishedAt, finishedIn } = mission
          return [
            `${mission.displayName}#${mission.id} (${utils.ceilTime(utils.diffDates(startedAt, finishedAt)) / MINUTE}分)`,
            `${startedAt.toLocaleString()}@${startedIn.displayName} → ${finishedAt.toLocaleString()}@${finishedIn.displayName}`,
            mission.tasks.map(({ type, startedIn, startedAt, finishedIn, finishedAt, injuredsCount }) => {
              const messages = []
              if (injuredsCount) messages.push(`負傷者数:${injuredsCount}`)
              if (startedIn.id !== finishedIn.id) messages.push(`距離: ${utils.distance(startedIn.position, finishedIn.position)}m`)
              messages.push(`${startedAt.toLocaleString()}@${startedIn.displayName} → ${finishedAt.toLocaleString()}@${finishedIn.displayName}`)
              return [
                `${taskTypeToLabel(type)} (${utils.ceilTime(utils.diffDates(startedAt, finishedAt)) / MINUTE}分)`,
                messages
              ]
            })
          ]
        })
      ]
    )),
    '基地',
    baseAgents.map(({ displayName, missions }) => ([
      displayName,
      missions.map(mission => {
        const { startedAt, finishedAt } = mission
        return [
          mission.displayName,
            `${startedAt.toLocaleString()} → ${finishedAt.toLocaleString()}`,
            mission.tasks.map(({ type, startedAt, finishedAt, transport, injuredsCount }) => {
              const messages = [taskTypeToLabel(type)]
              if (injuredsCount) messages.push(`負傷者数: ${injuredsCount}`)
              messages.push(`${startedAt.toLocaleString()} → ${finishedAt.toLocaleString()} (${transport.displayName})`)
              return messages
            })
        ]
      })
    ])),
    '被災地',
    shelterAgents.map(({ displayName, missions, requestedInjuredsCount, rescuedInjuredsCount, injuredsCount, rescueRate }) => ([
      displayName,
      [
        `要請数: ${requestedInjuredsCount}`,
        `救助済み: ${rescuedInjuredsCount}`,
        `未救助: ${injuredsCount}`,
        `救助率: ${rescueRate * 100}%`
      ],
      missions.map(mission => {
        const { startedAt, finishedAt } = mission
        return [
          mission.displayName,
            `${startedAt.toLocaleString()} → ${finishedAt.toLocaleString()}`,
            mission.tasks.map(({ type, startedAt, finishedAt, transport, injuredsCount }) => {
              const messages = [taskTypeToLabel(type)]
              if (injuredsCount) messages.push(`負傷者数: ${injuredsCount}`)
              messages.push(`${startedAt.toLocaleString()} → ${finishedAt.toLocaleString()} (${transport.displayName})`)
              return messages
            })
        ]
      }),
    ])),
    '基地間の距離',
    baseAgents.map((baseAgent, _, baseAgents) => ([
      baseAgent.displayName,
      baseAgents.map(toBaseAgent => ([
        `${baseAgent.displayName} => ${toBaseAgent.displayName}`,
        [
          `${utils.distance(baseAgent.position, toBaseAgent.position)}m`,
          `${
            utils.ceilTime(
              utils.moveTime(baseAgent.position, toBaseAgent.position, helicopterAgents[0].speed)
            ) / MINUTE
          }分`,
        ]
      ]))
    ]))
  ], 0)
}
