import type { LevelConfig } from "./level-types"

// 开发预览配置，需由所有者回放验证后再作为正式内容发布。
export const levels: readonly LevelConfig[] = [
  { id: 1, version: 1, type: "merge", title: "第一次翻倍", target: 16, seed: 104729, tip: "试着让两个相同的数字碰在一起。" },
  { id: 2, version: 1, type: "merge", title: "好事成双", target: 32, seed: 130363, tip: "把小数字慢慢合成更大的数字。" },
  { id: 3, version: 1, type: "layout", title: "留一点空间", target: 64, seed: 155921, tip: "空位越多，下一步的选择就越多。" },
  { id: 4, version: 1, type: "layout", title: "换个角度", target: 64, seed: 180503, tip: "试着把较大的数字留在同一侧。" },
  { id: 5, version: 1, type: "merge", title: "小小里程碑", target: 128, seed: 205019, tip: "耐心整理，让每次翻倍都有空间。" },
]

export function getLevel(id: number): LevelConfig {
  const level = levels.find(level => level.id === id)
  if (!level) throw new Error(`关卡不存在：${id}`)
  return level
}
