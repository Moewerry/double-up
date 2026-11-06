import type { LevelConfig } from "./level-types"

// 开发预览配置，需由所有者回放验证后再作为正式内容发布。
export const levels: readonly LevelConfig[] = [
  { id: 1, version: 1, type: "merge", title: "第一次翻倍", target: 16, seed: 104729, tip: "试着让两个相同的数字碰在一起。" },
  { id: 2, version: 1, type: "merge", title: "好事成双", target: 32, seed: 130363, tip: "把小数字慢慢合成更大的数字。" },
  { id: 3, version: 1, type: "layout", title: "留一点空间", target: 64, seed: 155921, tip: "空位越多，下一步的选择就越多。" },
  { id: 4, version: 2, type: "moves", title: "步步为营", target: 64, maxMoves: 60, seed: 180503, tip: "在 60 步内合出 64。" },
  { id: 5, version: 2, type: "moves", title: "精准翻倍", target: 64, maxMoves: 45, seed: 205019, tip: "在 45 步内合出 64。" },
]

export function getLevel(id: number): LevelConfig {
  const level = levels.find(level => level.id === id)
  if (!level) throw new Error(`关卡不存在：${id}`)
  if (level.maxMoves !== undefined && (!Number.isSafeInteger(level.maxMoves) || level.maxMoves < 1)) throw new Error(`第 ${id} 关的步数限制必须为正整数。`)
  return level
}
