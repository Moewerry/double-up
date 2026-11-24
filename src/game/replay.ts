import { createSession, move } from "./engine"
import { levels } from "./levels"
import { getStatus } from "./rules"
import { isSeed } from "./random"
import type { Direction, Session } from "./types"

export interface LevelReplay {
  rules: 1
  level: number
  configVersion: number
  seed: number
  target: number
  maxMoves?: number
  directions: Direction[]
  expected: { score: number; moves: number; maximum: number; random: number; board: number[]; openedDoors?: number[]; collapsedCells?: number[] }
}

export function boardValues(session: Session): number[] {
  return Array.from({ length: 16 }, (_, position) => session.tiles.find(tile => tile.position === position)?.value ?? 0)
}

export function recordReplay(session: Session, directions: Direction[]): LevelReplay {
  const level = levels.find(level => level.id === session.level)
  if (!level || session.status !== "won" || session.undoUsed || !isSeed(session.seed) || session.configVersion !== level.version || getStatus(session, level) !== "won" || level.maxMoves !== undefined && session.moves > level.maxMoves) throw new Error("只能记录符合当前配置且未使用撤销的通关路径。")
  return {
    rules: 1, level: level.id, configVersion: session.configVersion, seed: session.seed, target: level.target, maxMoves: level.maxMoves,
    directions: [...directions],
    expected: {
      score: session.score, moves: session.moves, maximum: Math.max(0, ...session.tiles.map(tile => tile.value)), random: session.random, board: boardValues(session),
      ...(level.puzzle ? { openedDoors: [...(session.openedDoors ?? [])], collapsedCells: [...(session.collapsedCells ?? [])] } : {}),
    },
  }
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value)
const integer = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0
const direction = (value: unknown): value is Direction => value === "left" || value === "right" || value === "up" || value === "down"

export function replaySolution(input: unknown): Session {
  if (!object(input) || input.rules !== 1 || !integer(input.level)) throw new Error("通关回放格式或规则版本不正确。")
  const level = levels.find(level => level.id === input.level)
  if (!level) throw new Error("回放引用了不存在的关卡。")
  if (!isSeed(input.seed)) throw new Error("回放开局种子不正确。")
  let session = createSession(level.id, input.seed)
  if (input.target !== level.target || input.configVersion !== session.configVersion || input.maxMoves !== level.maxMoves) throw new Error(`第 ${level.id} 关配置已变化，需要重新生成通关路径。`)
  if (!Array.isArray(input.directions) || !input.directions.every(direction) || input.directions.length > 10000) throw new Error("回放方向序列不正确或超出步数限制。")
  const expected = input.expected
  if (!object(expected) || !integer(expected.score) || !integer(expected.moves) || !integer(expected.maximum) || !integer(expected.random)) throw new Error("回放预期成绩不正确。")
  if (!Array.isArray(expected.board) || expected.board.length !== 16 || !expected.board.every(value => integer(value) && (value === 0 || value >= 2 && Number.isInteger(Math.log2(value))))) throw new Error("回放预期棋盘不正确。")

  for (const [index, step] of input.directions.entries()) {
    if (session.status !== "playing") throw new Error(`第 ${level.id} 关在第 ${index + 1} 步之前已经结束。`)
    const next = move(session, step).session
    if (next === session) throw new Error(`第 ${level.id} 关第 ${index + 1} 步是无效移动。`)
    session = next
  }
  if (session.status !== "won") throw new Error(`第 ${level.id} 关路径未能通关。`)
  if (session.score !== expected.score || session.moves !== expected.moves || Math.max(0, ...session.tiles.map(tile => tile.value)) !== expected.maximum || session.random !== expected.random || JSON.stringify(boardValues(session)) !== JSON.stringify(expected.board)) throw new Error(`第 ${level.id} 关的回放结果与记录不一致。`)
  if (level.puzzle && (JSON.stringify(session.openedDoors) !== JSON.stringify(expected.openedDoors) || JSON.stringify(session.collapsedCells) !== JSON.stringify(expected.collapsedCells))) throw new Error(`第 ${level.id} 关的机关状态与记录不一致。`)
  return session
}
