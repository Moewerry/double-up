import type { Direction } from "./types"

export interface Door { readonly position: number; readonly value: number }
export type PuzzleGoal = { readonly kind: "merge" } | { readonly kind: "doors" } | { readonly kind: "deliver"; readonly position: number }
export interface PuzzleConfig {
  readonly initialTiles: readonly { readonly position: number; readonly value: number }[]
  readonly walls: readonly number[]
  readonly doors: readonly Door[]
  readonly fragile: readonly number[]
  readonly goal: PuzzleGoal
  readonly solution: readonly Direction[]
}

export const levelTypes = [
  { id: "merge", label: "数字合并", description: "不限步数，通过合并达到本关目标。" },
  { id: "layout", label: "墙体通道", description: "借助墙体定位，绕路会合。" },
  { id: "moves", label: "限步挑战", description: "在规定的有效步数内合出目标数字。" },
  { id: "delivery", label: "送达终点", description: "合成目标数字，再送进终点。" },
  { id: "doors", label: "数字锁门", description: "用相同数字打开锁门，继续前进。" },
  { id: "fragile", label: "一次性地板", description: "经过后离开的地板会坍塌，先安排好路线。" },
] as const

export type LevelType = typeof levelTypes[number]["id"]

export interface LevelConfig {
  readonly id: number
  readonly version: number
  readonly type: LevelType
  readonly title: string
  readonly target: number
  readonly maxMoves?: number
  /** 固定关卡元数据，以及旧版随机关卡与回放使用的种子。 */
  readonly seed: number
  readonly tip: string
  readonly puzzle?: PuzzleConfig
  readonly hintDirection?: Direction
}

export function getLevelType(type: LevelType) {
  const definition = levelTypes.find(definition => definition.id === type)
  if (!definition) throw new Error(`未知的关卡类型：${type}`)
  return definition
}
