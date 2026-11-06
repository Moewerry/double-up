export const levelTypes = [
  { id: "merge", label: "数字合并", description: "不限步数，通过合并达到本关目标。" },
  { id: "layout", label: "布局练习", description: "在固定开局中练习保留空位和摆放大数字。" },
] as const

export type LevelType = typeof levelTypes[number]["id"]

export interface LevelConfig {
  readonly id: number
  readonly version: 1
  readonly type: LevelType
  readonly title: string
  readonly target: number
  readonly seed: number
  readonly tip: string
}

export function getLevelType(type: LevelType) {
  const definition = levelTypes.find(definition => definition.id === type)
  if (!definition) throw new Error(`未知的关卡类型：${type}`)
  return definition
}
