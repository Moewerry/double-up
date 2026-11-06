import { describe, expect, it } from "vitest"
import { canMove, createSession, move, undo } from "./engine"
import type { Direction, Session } from "./types"

function fixture(board: readonly number[], level = 5): Session {
  return { ...createSession(level), tiles: board.flatMap((value, position) => value ? [{ id: position + 1, value, position }] : []), nextId: 17 }
}
function beforeSpawn(session: Session) {
  return Array.from({ length: 16 }, (_, position) => session.tiles.find(tile => tile.position === position && tile.id !== session.nextId - 1)?.value ?? 0)
}

describe("移动与合并", () => {
  it.each([
    { row: [2, 2, 2, 2], expected: [4, 4, 0, 0], score: 8 },
    { row: [2, 2, 4, 0], expected: [4, 4, 0, 0], score: 4 },
    { row: [4, 0, 4, 4], expected: [8, 4, 0, 0], score: 8 },
  ])("$row 向左合并为 $expected", ({ row, expected, score }) => {
    const initial = fixture([...row, ...Array<number>(12).fill(0)])
    const original = structuredClone(initial)
    const result = move(initial, "left")
    expect(beforeSpawn(result.session).slice(0, 4)).toEqual(expected)
    expect(result.gained).toBe(score)
    expect(result.session.score).toBe(score)
    expect(result.session.moves).toBe(1)
    expect(initial).toEqual(original)
  })

  const directions: { direction: Direction; positions: number[]; destination: number }[] = [
    { direction: "left", positions: [0, 3], destination: 0 },
    { direction: "right", positions: [0, 3], destination: 3 },
    { direction: "up", positions: [0, 12], destination: 0 },
    { direction: "down", positions: [0, 12], destination: 12 },
  ]
  it.each(directions)("$direction 合并方向一致且只生成一个新方块", ({ direction, positions, destination }) => {
    const initial = fixture(Array.from({ length: 16 }, (_, position) => positions.includes(position) ? 2 : 0))
    const result = move(initial, direction)
    expect(beforeSpawn(result.session)[destination]).toBe(4)
    expect(result.session.tiles).toHaveLength(2)
    expect([2, 4]).toContain(result.session.tiles.find(tile => tile.id === result.session.nextId - 1)?.value)
    expect(result.motions).toHaveLength(2)
    expect(result.motions.every(motion => motion.merged && motion.destination === destination)).toBe(true)
    expect(new Set(result.session.tiles.map(tile => tile.id)).size).toBe(2)
  })

  it("无效操作不消耗步数、随机状态或撤销快照", () => {
    const initial = fixture([2, 4, 8, 16, ...Array<number>(12).fill(0)])
    const previous = { tiles: initial.tiles, score: 0, moves: 0, random: initial.random, nextId: initial.nextId, status: "playing" as const }
    const state = { ...initial, moves: 1, previous }
    const result = move(state, "left")
    expect(result.session).toBe(state)
    expect(result.session.previous).toBe(previous)
    expect(result.motions).toEqual([])
    expect(result.gained).toBe(0)
  })
})

describe("胜负与撤销", () => {
  const almostFull = [2, 2, 8, 16, 8, 16, 32, 64, 16, 32, 64, 8, 32, 64, 8, 16]

  it("有效移动后满盘且无可合并方块时失败，仍允许一次撤销", () => {
    const initial = fixture(almostFull)
    const result = move(initial, "left").session
    expect(result.status).toBe("lost")
    expect(canMove(result.tiles)).toBe(false)
    const restored = undo(result)
    expect(restored.status).toBe("playing")
    expect(restored.tiles).toEqual(initial.tiles)
    expect(restored.undoUsed).toBe(true)
  })

  it("同一步达标且棋盘无路可走时优先判定通关", () => {
    const initial = fixture([64, 64, ...almostFull.slice(2)])
    const result = move(initial, "left").session
    expect(result.status).toBe("won")
    expect(canMove(result.tiles)).toBe(false)
    expect(undo(result)).toBe(result)
    expect(move(result, "down").session).toBe(result)
  })

  it("有空位或满盘存在相邻相等数字时，仍可移动", () => {
    const full = fixture([2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2])
    expect(canMove(full.tiles)).toBe(false)
    expect(canMove(full.tiles.slice(1))).toBe(true)
    expect(canMove(full.tiles.map(tile => tile.position === 1 ? { ...tile, value: 2 } : tile))).toBe(true)
  })

  it("撤销恢复随机流和方块 ID，相同方向完整复现，且每局只能使用一次", () => {
    const initial = fixture([2, 2, 4, ...Array<number>(13).fill(0)])
    const first = move(initial, "left").session
    const restored = undo(first)
    const replayed = move(restored, "left").session
    expect(replayed.tiles).toEqual(first.tiles)
    expect(replayed.random).toBe(first.random)
    expect(replayed.nextId).toBe(first.nextId)
    expect(replayed.score).toBe(first.score)
    expect(replayed.moves).toBe(first.moves)
    expect(replayed.undoUsed).toBe(true)
    expect(undo(replayed)).toBe(replayed)
  })

  it("新局可复现初始棋盘，并重置撤销资格", () => {
    expect(createSession(5)).toEqual(createSession(5))
    expect(createSession(5).undoUsed).toBe(false)
    expect(createSession(5).previous).toBeNull()
  })
})
