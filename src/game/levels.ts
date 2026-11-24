import type { LevelConfig, PuzzleGoal } from "./level-types"
import { levelDesigns } from "./level-designs"

export const levels: readonly LevelConfig[] = levelDesigns.map((design, index): LevelConfig => {
  const initialTiles: { position: number; value: number }[] = []
  const walls: number[] = [], fragile: number[] = []
  const doors: { position: number; value: number }[] = []
  let goal: PuzzleGoal = { kind: design.goal ?? "merge" }
  if (design.board.some(row => row.split(" ").length !== 4)) throw new Error(`第 ${index + 1} 关必须使用 4×4 棋盘。`)
  const cells = design.board.flatMap(row => row.split(" "))
  for (const [position, cell] of cells.entries()) {
    if (cell === "#") walls.push(position)
    else if (cell === "F") fragile.push(position)
    else if (cell.startsWith("K")) doors.push({ position, value: Number(cell.slice(1)) })
    else if (cell === "G") goal = { kind: "deliver", position }
    else if (cell !== ".") initialTiles.push({ position, value: Number(cell) })
  }
  fragile.push(...(design.fragile ?? []))
  return {
    id: index + 1, version: 10, type: fragile.length ? "fragile" : doors.length ? "doors" : goal.kind === "deliver" ? "delivery" : walls.length ? "layout" : "merge",
    title: design.title, target: design.target, seed: 104729 + index, tip: design.tip,
    hintDirection: design.hintDirection,
    puzzle: { initialTiles, walls, doors, fragile, goal, solution: design.solution },
  }
})

export function getLevel(id: number): LevelConfig {
  const level = levels.find(level => level.id === id)
  if (!level) throw new Error(`关卡不存在：${id}`)
  if (level.maxMoves !== undefined && (!Number.isSafeInteger(level.maxMoves) || level.maxMoves < 1)) throw new Error(`第 ${id} 关的步数限制必须为正整数。`)
  return level
}
