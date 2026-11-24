import type { LevelConfig } from "./level-types"

// 保留旧版随机合并规则的回归场景，正式关卡使用 levels.ts 的固定解谜配置。
export const levels: readonly LevelConfig[] = [
  { id: 1, version: 1, type: "merge", title: "第一次翻倍", target: 16, seed: 104729, tip: "" },
  { id: 2, version: 1, type: "merge", title: "好事成双", target: 32, seed: 130363, tip: "" },
  { id: 3, version: 1, type: "layout", title: "留一点空间", target: 64, seed: 155921, tip: "" },
  { id: 4, version: 2, type: "moves", title: "步步为营", target: 64, maxMoves: 60, seed: 180503, tip: "" },
  { id: 5, version: 2, type: "moves", title: "精准翻倍", target: 64, maxMoves: 45, seed: 205019, tip: "" },
]

export function getLevel(id: number): LevelConfig {
  const level = levels.find(level => level.id === id)
  if (!level) throw new Error(`关卡不存在：${id}`)
  return level
}
