# 概要
- 今回のシミュレーションでは、シミュレータと環境とエージェントが互いに対話をしながらシミュレーションを実行した

## シミュレータ
- シミュレーターは与えられた条件に応じて、環境とエージェントを準備する。
- シミュレーションの開始の要求がされた後、環境とエージェントと対話しながらシミュレーションを実行する

## 環境
- 環境は日時とエージェントを保有する
- シミュレーターの要求に応じて日時を進める
- シミュレーターの要求に応じてエージェントを返す

## エージェント
- 自身の行動をミッションとして保有する
- 今回の場合、ヘリコプターと被災地と基地がエージェントに対応する
- すべてのエージェントは並行して実行できるミッションの数に決まりがある

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/er-agents/agents-entity-relationship.png?raw=true)

# スケジュール
- エージェントはスケジュールを持つ
- 単一の実行者としてのエージェントを有する
- ミッションは複数のタスクを保有する
- 救助や帰還などのミッションが存在する

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/er-schedule/schedule-entity-relationship.png?raw=true)

```ts
export interface ScheduleCache <TT, T extends Task<TT>, M extends Mission<TT, T>> {
  lastMission: M;
  freeTasks: GeneralTask[];
  taskTypeToTasks: Map<TT, T[]>;
  finishedAtTimeToTasks: Map<number, Map<number, T>>;
  startedAtTimeToMissions: Map<number, Map<number, M>>;
  finishedAtTimeToMissions: Map<number, Map<number, M>>;
  activeMissions: Map<number, M>;
  notFinishedMissions: Map<number, M>;
  notPassedMissionPoints: Map<number, Date>;
}

export type PlaceScheduleCache = {

} & ScheduleCache<PlaceTaskType, PlaceTask, PlaceMission>

export type ShelterScheduleCache = {
  rescuedInjuredsCount: number;
  willRescuedInjuredsCount: number;
} & PlaceScheduleCache

export type BaseScheduleCache = {
  injuredsCount: number;
} & PlaceScheduleCache

export type TransportScheduleCache = {
  rescuedInjuredsCount: number;
} & ScheduleCache<TransportTaskType, TransportTask, TransportMission>

export interface Schedule<TT, T extends Task<TT>, M extends Mission<TT, T>, C extends ScheduleCache<TT, T, M>> {
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  parallelMissionsCount: number;
  missions: M[];
  cache: C;
}

export type PlaceSchedule = Schedule<PlaceTaskType, PlaceTask, PlaceMission, PlaceScheduleCache>

export type ShelterSchedule = Schedule<PlaceTaskType, PlaceTask, PlaceMission, ShelterScheduleCache>

export type BaseSchedule = Schedule<PlaceTaskType, PlaceTask, PlaceMission, BaseScheduleCache>

export type TransportSchedule = Schedule<TransportTaskType, TransportTask, TransportMission, TransportScheduleCache>
```

## ミッションとタスク
- ミッションは一つ以上のタスクを保有している
- すべてのタスクは以下の情報を持っている
  - タスク開始時間
  - タスク終了時間
  - 所要時間
  - タスク種別
    - 移動、救助など
  - その他の情報
    - タスク開始場所、タスク終了場所など
- ミッションとタスクの一覧
- タスクの概念をつくることでタスク終了時に救助率の変更などを可能にした

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/er-tasks/tasks-entity-relationship.png?raw=true)

```ts
export interface Mission<TT, T extends Task<TT>> {
  id: number;
  agentID: number;
  displayName: string;
  startedAt: Date;
  finishedAt: Date;
  duration: number;
  tasks: T[];
}

export type PlaceMission = Mission<PlaceTaskType, PlaceTask>

export type TransportMission = {
  startedIn: Place;
  finishedIn: Place;
} & Mission<TransportTaskType, TransportTask>
```

```ts
import { Transport } from './transports'
import { Place } from './places'

export enum GeneralTaskType {
  FREE = 'TASK_TYPE/FREE'
}

export enum TransportTaskType {
  MOVE = 'TASK_TYPE/TRANSPORT/MOVE',
  WAIT = 'TASK_TYPE/TRANSPORT/WAIT',
  RESCUE = 'TASK_TYPE/TRANSPORT/RESCUE',
  UNLOAD = 'TASK_TYPE/TRANSPORT/UNLOAD',
  REFUEL = 'TASK_TYPE/TRANSPORT/REFUEL',
  STAY = 'TASK_TYPE/TRANSPORT/STAY'
}

export enum PlaceTaskType {
  RESCUE = 'TASK_TYPE/PLACE/RESCUE',
  UNLOAD = 'TASK_TYPE/PLACE/UNLOAD',
  REFUEL = 'TASK_TYPE/PLACE/REFUEL',
  HOLD = 'TASK_TYPE/PLACE/HOLD',
}

export interface Task<TT> {
  id: number,
  type: TT;
  startedAt: Date;
  finishedAt: Date;
  duration: number;
}

export type GeneralTask = Task<GeneralTaskType>

export type TransportTask = {
  startedIn: Place;
  finishedIn: Place;
  injuredsCount: number;
  isRefueled: boolean;
} & Task<TransportTaskType>

export type PlaceTask = {
  transport: Transport;
  injuredsCount: number;
} & Task<PlaceTaskType>

export type TaskTyep = GeneralTaskType | TransportTaskType | PlaceTaskType
```


## 空き時間の算出
- 基本的には最終ミッション完了後の時間がミッション可能時間になる
- すでに確定しているミッションの間の時間を活用するためミッション作成可能時間を生成する
- 新しいミッションが確定したタイミングで自身の新しいミッション作成可能時間を生成する
- 空き時間の算出に必要な情報は以下の通り
  - 現在日時
  - ミッション数の切り替わり日時
  - 現在日時よりも先のミッション開始日時
  - 現在日時よりも先のミッション終了日時
  - 未終了のミッションの一覧

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/documents/images/concept-free-tasks.png?raw=true)

```ts
buildFreeTasks (current: Date): GeneralTask[] {
  const { parallelMissionsCount } = this.schedule

  const notFinishedMissions = Array.from(this.schedule.cache.notFinishedMissions.values())
  const points = [current, ...Array.from(this.schedule.cache.notPassedMissionPoints.values())].sort((a, b) => a > b ? 1 : -1)

  const freeTasks = points.reduce((tasks: GeneralTask[], current: Date, index: number, points: Date[]): GeneralTask[] => {
    if(index === 0) return tasks

    const prev = points[index - 1]
    if (this.getActiveMissionsCount(notFinishedMissions, prev) >= parallelMissionsCount) {
      return tasks
    }

    const lastTask = tasks.splice(-1, 1)[0]
    const task = builders.tasks.free(prev, current)
    if (!lastTask) return [...tasks, task]

    if (lastTask.finishedAt < task.startedAt) return [...tasks, lastTask, task]

    const unionedTask = builders.tasks.free(lastTask.startedAt, task.finishedAt)
    return [...tasks, unionedTask]
  }, [])

  return freeTasks
}
```

### 計算手順

- 現日時と現在よりも先のミッションの開始日時と終了日時を昇順で並べる
- 現時点(各日時)の前時点(直前の日時)の作業中のミッションを未終了ミッションの中から見つけて数を数える
- 前時点のミッションの平行可能実行数未満であった場合、前時点から現時点をミッション作成可能時間とする
- 生成されたミッション作成可能時間のうち連続している(終了日時と開始日時が同一)ものがあればそれを連結する
  - 並行するタスクの数が多いエージェントは小さく連続する追加可能時間が発生する可能性がある
  - 連結することで作成された追加可能時間よりも長いミッションを追加できるようになる

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/fc-build-free-tasks/build-free-tasks-flow-chart.png?raw=true)

# ヘリコプターの行動

- ヘリコプターは毎分自分の状態を確認し以下のアルゴリズムに従いミッションを作成する必要がある場合はミッションを作成する
- 行動について
  - 現日時に取り組んでいるミッションがあるのかを確認し、取り組んでいるミッションが存在する場合は該当日時ではミッションを作成しない
  - 対象被災地(救助するべき被災地)がない場合はミッションを作成することができないので、該当日時ではミッションを作成しない
  - 対象被災地の中から最適な救助ミッションを作成する、
    - 最適な救助ミッションがない場合
      - 最適なHB(ヘリベース)へ帰還する
    - 最適なミッションがあるが実行不可能な場合
      - そのミッションの終了日時が当日作業終了日時を上回っている場合は、最適なHBへ帰還する
      - また、そのミッションの終了後、最長の帰還ミッションを作成し、作業時間内にHBに帰還できない場合、最適なヘリベースへ帰還する
    - 最適ミッションがあり、実行可能な場合
      - 最適なミッションを確定する

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/fc-helicopter-action/helicopter-agent-action-flow-chart.png?raw=true)


```ts
action (): void {
  super.action()
  if (this.isWorking) {
    return
  }

  const shelterAgents = this.filterShelterAgents(this.environment.shelterAgents)
  if (shelterAgents.length < 1) {
    this.submitMission(this.buildOptimalReturnMission(this.scheduleService.lastMission))
    return
  }

  const rescueMission = this.buildOptimalRescueMission(shelterAgents)
  const finishDate = this.scheduleService.getFinishDate(this.current)
  if (rescueMission === null || rescueMission.finishedAt > finishDate) {
    this.submitMission(this.buildOptimalReturnMission(this.scheduleService.lastMission))
    return
  }

  const moveToLatestHelicopterBaseTime = this.getMoveToLatestHelicopterBaseTime(rescueMission.finishedIn)
  const arrivedInLatestHelicopterBaseAt = utils.addDateAndTime(rescueMission.finishedAt, moveToLatestHelicopterBaseTime)
  if (arrivedInLatestHelicopterBaseAt > finishDate) {
    this.submitMission(this.buildOptimalReturnMission(this.scheduleService.lastMission))
    return
  }

  this.submitMission(rescueMission)
}
```

## 対象被災地について
- 将来的な未完了の救助者1人以上いる被災地
  - 将来的な未完了の救助者とは、確定済みの救助ミッションの救助数の合計
- ヘリコプターの最終ミッションの終了地点からヘリコプター自身の連続飛行時間内で完了できる被災地
  - 救助ミッションを作成する
  - 救助ミッションの連続飛行時間を計算
  -  救助ミッションの連続飛行時間が自身の連続最高飛行時間と比較する

```ts
filterShelterAgents(shelterAgents: ShelterAgent[]): ShelterAgent[] {
  return shelterAgents.filter(shelterAgent => {
    if (shelterAgent.willInjuredsCount < 1) return false

    const mission = this.buildRescueMission(shelterAgent)
    if (new TransportMissionService(mission).flightTime > this.transport.maxContinuousFlightTime) {
      return false
    }

    return true
  })
}
```

## 最適な救助ミッションの選定

- 最適なミッションが見つからない場合がある

### 基本的な流れ
  1. 与えられた被災地の一覧の中から最適な最適な被災地を選ぶ
  2. 最適な被災地に対して全ヘリコプターが救助ミッションを作成する
  3. 作成された救助ミッションの中で最速で終わるミッションを選ぶ
  4. 最速で終わるミッションの実行者が自分の場合はそれを最適なミッションとする
  5. 最速で終わるミッションの実行者が自分でない場合は 1.で与えられた被災地の一覧から 1.で決めた最適な被災地を取り除いた一覧を作成して1.に戻る

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/fc-build-optimal-rescue-mission/build-optimal-rescue-mission-flow-chart.png?raw=true)

```ts
buildOptimalRescueMission (targetShelterAgents: ShelterAgent[]): (TransportMission|null) {
  if (targetShelterAgents.length < 1) return null

  let shelterAgents = [...targetShelterAgents]
  if (this.useRescueRate) {
    const rescuRateToAgents = new Map<number, ShelterAgent[]>()
    let minRescueRate = null
    targetShelterAgents.forEach(agent => {
      const rate = agent.rescueRate
      const agents = rescuRateToAgents.get(rate) || []
      rescuRateToAgents.set(rate, [...agents, agent])
      minRescueRate = minRescueRate === null ? rate : Math.min(rate, minRescueRate)
    })
    shelterAgents = rescuRateToAgents.get(minRescueRate)
  }

  const fastestMission = shelterAgents.reduce((fastestMission: (TransportMission|null), shelterAgent) => {
    const mission = this.buildRescueMission(shelterAgent)
    if (fastestMission === null) return mission
    return fastestMission.finishedAt < mission.finishedAt ? fastestMission : mission
  }, null)

  const rescueShelterAgent = this.environment.getShelterAgentByPlaceID(
    new TransportMissionService(fastestMission).rescuePlace.id
  )

  const missions = this.environment.helicopterAgents.map(agent => agent.buildRescueMission(rescueShelterAgent))

  const optimalMissions = new MissionsService(missions).fastestMissions
  if (optimalMissions.has(this.id)) {
    const mission = optimalMissions.get(this.id)
    return mission
  } else if (targetShelterAgents.length > 1) {
    const nextTargetShelterAgents = targetShelterAgents.filter(shelterAgent => shelterAgent.id !== rescueShelterAgent.id)
    return this.buildOptimalRescueMission(nextTargetShelterAgents)
  } else {
    return null
  }
}
```


### 待機時間と最適なミッション

- いずれのヘリコプターが同じ被災地に対してミッションを作った場合、同様に待機時間が発生する
- 他ヘリとの比較によって被災地を選ぶ処理の段階では待機時間を加味する必要がない
- 同じ救助率の被災地の中から被災地を選ぶ場合は待機時間を加味して最短でミッションが終了する

### 救助ミッションの作成
- 最大のタスクの流れ
  - 被災地への移動
    - 直前のミッション終了力被災地への移動
  - 被災地での待機
    - 移動完了後から救助開始までの間の待機
    - 必須ではない
  - 救助
    - 被災地での救助
  - 降機基地への移動
    - 最も早く降機できる基地への移動
  - 降機基地での待機
    - 移動完了後から救助開始までの間の待機
    - 必須ではない
  - 降機
    - 降機基地での降機
  - 給油基地への移動
    - 降機基地から給油基地への移動
    - 必須ではない
      - 降機基地が給油可能でかつ、降機基地での給油が最速の場合は必要がない
  - 給油基地での待機
    - 移動完了後から給油開始までの間の待機
    - 必須ではない
  - 給油
    - 給油基地での給油
- 待機時間の算出方法
  - 移動先への到着時間の算出
  - 到着時間以降で移動先でのタスク時間分の可能な空き時間の取得
  - 空き時間内での移動先でのタスクの作成
  - 到着完了日時と移動先でのタスクの開始日時のズレがある場合、待機タスクを作成

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/fc-build-rescue-mission/build-rescue-mission-flow-chart.png?raw=true)

```ts
buildRescueMission (shelterAgent: ShelterAgent): TransportMission|null {
  const tasks: TransportTask[] = []

  const { environment, transportService } = this
  const { lastMission } = this.scheduleService
  const startedAt = lastMission.finishedAt > this.current  ? lastMission.finishedAt : this.current
  const moveToShelterTask = transportService.buildMoveToPlaceTask(
    startedAt,
    lastMission.finishedIn,
    shelterAgent.place
  )
  tasks.push(moveToShelterTask)

  const rescueTask = transportService.buildRescueTask(
    shelterAgent.getLandableAt(moveToShelterTask.finishedAt, +config.get('TASK_DURATION_RESCUE')),
    shelterAgent.place,
    Math.min(shelterAgent.willInjuredsCount, this.helicopter.maxInjuredsCount)
  )

  if (!utils.equalDate(moveToShelterTask.finishedAt, rescueTask.startedAt)) {
    const waitInShelterTask = builders.tasks.transports.wait(
      moveToShelterTask.finishedAt,
      rescueTask.startedAt,
      shelterAgent.place
    )
    tasks.push(waitInShelterTask)
  }
  tasks.push(rescueTask)

  const unloadBaseAgent = environment.baseAgents.map(baseAgent => {
    const moveToUnloadTask = transportService.buildMoveToPlaceTask(
      rescueTask.finishedAt,
      rescueTask.finishedIn,
      baseAgent.place
    )
    return {
      baseAgent,
      landableAt: baseAgent.getLandableAt(
        moveToUnloadTask.finishedAt,
        +config.get('TASK_DURATION_UNLOAD') + (baseAgent.isRefuelable ? +config.get('TASK_DURATION_REFUEL') : 0)
      )
    }
  }).sort((a, b) => a.landableAt.getTime() - b.landableAt.getTime())[0].baseAgent

  const moveToUnloadBaseTask = transportService.buildMoveToPlaceTask(
    rescueTask.finishedAt,
    shelterAgent.place,
    unloadBaseAgent.place
  )
  tasks.push(moveToUnloadBaseTask)

  const unloadTask = transportService.buildUnloadTask(
    unloadBaseAgent.getLandableAt(moveToUnloadBaseTask.finishedAt, +config.get('TASK_DURATION_UNLOAD')),
    unloadBaseAgent.place,
    rescueTask.injuredsCount
  )

  if (!utils.equalDate(moveToUnloadBaseTask.finishedAt, unloadTask.startedAt)) {
    const waitInUnloadBaseTask = transportService.buildWaitTask(
      moveToUnloadBaseTask.finishedAt,
      unloadTask.startedAt,
      unloadBaseAgent.place
    )
    tasks.push(waitInUnloadBaseTask)
  }
  tasks.push(unloadTask)

  let refuelableBaseAgents = [...environment.refuelableBaseAgents]

  if (unloadBaseAgent.isRefuelable) {
    const clonedUnloadBaseAgent = unloadBaseAgent.clone()
    clonedUnloadBaseAgent.addMission(
      builders.missions.places.unloadByTransportTaskAndTransport(
        clonedUnloadBaseAgent.id,
        unloadTask,
        this.transport
      )
    )
    refuelableBaseAgents = refuelableBaseAgents.map(baseAgent =>
      baseAgent.id === clonedUnloadBaseAgent.id ? clonedUnloadBaseAgent : baseAgent
    )
  }

  const optimalRefuelBaseAgent = refuelableBaseAgents.map(refualbeBaseAgent => {
    const moveToUnloadTask = transportService.buildMoveToPlaceTask(
      unloadTask.finishedAt,
      unloadTask.finishedIn,
      refualbeBaseAgent.place
    )
    return {
      baseAgent: refualbeBaseAgent,
      landableAt: refualbeBaseAgent.getLandableAt(
        moveToUnloadTask.finishedAt,
        +config.get('TASK_DURATION_REFUEL')
      )
    }
  }).sort((a, b) => a.landableAt.getTime() - b.landableAt.getTime())[0].baseAgent

  const moveToRefuelableBaseTask = transportService.buildMoveToPlaceTask(
    unloadTask.finishedAt,
    unloadTask.finishedIn,
    optimalRefuelBaseAgent.place
  )
  if (moveToRefuelableBaseTask.duration > 0) {
    tasks.push(moveToRefuelableBaseTask)
  }

  const refuelTask = transportService.buildRefuelTask(
    optimalRefuelBaseAgent.getLandableAt(moveToRefuelableBaseTask.finishedAt, +config.get('TASK_DURATION_REFUEL')),
    optimalRefuelBaseAgent.place
  )

  if (!utils.equalDate(moveToRefuelableBaseTask.finishedAt, refuelTask.startedAt)) {
    const waitInRefuelBaseTask = transportService.buildWaitTask(
      moveToRefuelableBaseTask.finishedAt,
      refuelTask.startedAt,
      refuelTask.startedIn
    )
    tasks.push(waitInRefuelBaseTask)
  }
  tasks.push(refuelTask)

  return builders.missions.transports.rescue(this.id, tasks)
}
```

## 作業時間内のHBへの帰還について
- 前提
  - ヘリコプターは作業時間終了までにHBに帰還する必要がある
  - すべてのヘリコプターがいずれかのヘHBに必ず帰還できるようにHBの着陸可能数がある
  - いずれのFBからでもHBへ一度の飛行で到達可能である（連続飛行時間）
- 救助ミッションの完了後、その地点から最も遠いHBへの移動が作業時間内に完了可能であればそのミッションを行っても作業時間内に帰還できると考える
  - 帰還先の基地での待機は発生しないものとする

### 最適な帰還ミッションの作成
- 直前のミッションの終了時間と終了地点を取得する
- 終了地点から最も近いHBを探す
- 直前の終了時間と終了場所、最も近いHBを用いて帰還ミッションを作成する

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/fc-build-optimal-return-base-mission/build-optimal-return-base-mission-flow-chart.png?raw=true)

```ts
buildOptimalReturnMission (beforeMission: TransportMission): TransportMission {
  const transportService = this.transportService
  const startedAt = beforeMission.finishedAt > this.current  ? beforeMission.finishedAt : this.current
  const startedIn = beforeMission.finishedIn
  const helicopterBases = this.environment.helicopterBases
  const fastestArrivableHelicopterBases = transportService.getFastestArrivablePlaces(startedIn, helicopterBases)
  const fastestArrivableHelicopterBase = fastestArrivableHelicopterBases[0]
  return this.buildReturnBaseMission(startedAt, startedIn, fastestArrivableHelicopterBase)
}
```

### 帰還ミッションの作成
- 開始時間と開始場所、帰還場所を元に帰還ミッションの作成を行う
- タスクの作成
  - 移動タスクの作成
    - 最寄りのHBへの移動タスクを作成する
  - 給油タスクの作成
    - 基地到着後すぐに給油する
    - 翌日の作業開始時点で連続飛行可能時間を最大にするため
  - 滞在タスクの作成
    - 滞在タスクは翌日の作業開始日時までHBに滞在する

![](https://github.com/seekseep/rescue-helicopter-simulation/blob/master/out/uml/fc-build-return-base-mission/build-return-base-mission-flow-chart.png?raw=true)

```ts
buildReturnBaseMission (startedAt: Date, startedIn: Place, stayedIn: Place): TransportMission {
  const { environment, transportService, scheduleService } = this
  const tasks = []

  const baseAgent = environment.getBaseAgentByPlaceID(stayedIn.id).clone()
  const startDateOfNextDay = scheduleService.getStartDateOfNextDay(this.current)

  const moveToReturnBaseTask = transportService.buildMoveToPlaceTask(
    startedAt,
    startedIn,
    stayedIn
  )
  tasks.push(moveToReturnBaseTask)

  const refuelTask = transportService.buildRefuelTask(
    baseAgent.getLandableAt(
      moveToReturnBaseTask.finishedAt,
      utils.diffDates(moveToReturnBaseTask.finishedAt, startDateOfNextDay)
    ),
    stayedIn
  )
  baseAgent.addMission(
    builders.missions.places.refuelByTransportTaskAndTransport(
      baseAgent.id,
      refuelTask,
      this.transport
    )
  )

  if (!utils.equalDate(moveToReturnBaseTask.finishedAt, refuelTask.startedAt)) {
    tasks.push(
      transportService.buildWaitTask(
        moveToReturnBaseTask.finishedAt,
        refuelTask.startedAt,
        stayedIn
      )
    )
  }
  tasks.push(refuelTask)

  const stayTask = transportService.buildStayTask(
    refuelTask.finishedAt,
    startDateOfNextDay,
    stayedIn
  )
  tasks.push(stayTask)

  return builders.missions.transports.returnBase(this.id, tasks)
}
```