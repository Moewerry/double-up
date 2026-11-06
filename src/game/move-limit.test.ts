import { describe, expect, it } from "vitest"
import { canMove, createSession, move, undo } from "./engine"
import { getLevel } from "./levels"
import { failureReason, remainingMoves } from "./rules"
import type { Session } from "./types"

const limit = getLevel(4).maxMoves!
function fixture(board: number[], moves: number, level = 4): Session {
  return { ...createSession(level, getLevel(level).seed), moves, tiles: board.flatMap((value, position) => value ? [{ id: position + 1, value, position }] : []), nextId: 17 }
}

describe("限步关卡", () => {
  it("不限步数的前期关卡不会因为步数较多而结束", () => {
    const initial = fixture([2, 2, ...Array<number>(14).fill(0)], 1000, 1)
    const result = move(initial, "left").session
    expect(result.status).toBe("playing")
    expect(result.moves).toBe(1001)
    expect(remainingMoves(result.moves, getLevel(1).maxMoves)).toBeUndefined()
  })

  it("最后一次有效移动未达标，即使仍能滑动也会失败并停止接受输入", () => {
    const initial = fixture([2, 2, ...Array<number>(14).fill(0)], limit - 1)
    const result = move(initial, "left").session
    expect(result.moves).toBe(limit)
    expect(canMove(result.tiles)).toBe(true)
    expect(result.status).toBe("lost")
    expect(remainingMoves(result.moves, limit)).toBe(0)
    expect(failureReason(result, getLevel(4))).toBe("moves")
    expect(move(result, "right").session).toBe(result)
  })

  it("最后一步合出目标，优先判定通关", () => {
    const initial = fixture([32, 32, ...Array<number>(14).fill(0)], limit - 1)
    const result = move(initial, "left").session
    expect(result.moves).toBe(limit)
    expect(result.status).toBe("won")
    expect(failureReason(result, getLevel(4))).toBeNull()
    expect(result.configVersion).toBe(getLevel(4).version)
  })

  it("无效滑动不扣最后一步，也不改变随机流或快照", () => {
    const initial = fixture([2, 0, 0, 0, 4, ...Array<number>(11).fill(0)], limit - 1)
    const invalid = move(initial, "left")
    expect(invalid.session).toBe(initial)
    expect(invalid.motions).toEqual([])
    expect(invalid.gained).toBe(0)
    expect(remainingMoves(invalid.session.moves, limit)).toBe(1)
    expect(move(initial, "right").session.status).toBe("lost")
  })

  it("步数还有剩余时，棋盘堵死仍会正常失败", () => {
    const initial = fixture([2, 2, 8, 16, 8, 16, 32, 8, 16, 32, 8, 16, 32, 8, 16, 32], 0)
    const result = move(initial, "left").session
    expect(result.status).toBe("lost")
    expect(canMove(result.tiles)).toBe(false)
    expect(remainingMoves(result.moves, limit)).toBe(limit - 1)
    expect(failureReason(result, getLevel(4))).toBe("blocked")
  })

  it("内部快照恢复保留限步配置版本和随机流", () => {
    const initial = fixture([2, 2, ...Array<number>(14).fill(0)], limit - 1)
    const first = move(initial, "left").session
    const restored = undo(first)
    expect(restored.configVersion).toBe(getLevel(4).version)
    expect(remainingMoves(restored.moves, limit)).toBe(1)
    const repeated = move(restored, "left").session
    expect(repeated.tiles).toEqual(first.tiles)
    expect(repeated.random).toBe(first.random)
    expect(repeated.status).toBe("lost")
  })
})
