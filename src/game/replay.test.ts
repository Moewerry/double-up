import { describe, expect, it, vi } from "vitest"
import { createSession } from "./engine"
import { getLevel } from "./levels"
import { recordReplay, replaySolution } from "./replay"

vi.mock("./levels", () => import("./legacy-levels.fixture"))

describe("正式配置通关回放的边界", () => {
  it("未通关或使用过撤销的局面不能导出成通关记录", () => {
    expect(() => recordReplay(createSession(1), [])).toThrow("只能记录")
    expect(() => recordReplay({ ...createSession(1), status: "won", undoUsed: true }, [])).toThrow("只能记录")
  })

  it("拒绝未知关卡、旧配置以及非法方向", () => {
    expect(() => replaySolution({ rules: 1, level: 99 })).toThrow("不存在")
    expect(() => replaySolution({ rules: 1, level: 1, seed: 1, target: 32, configVersion: 1 })).toThrow("配置已变化")
    expect(() => replaySolution({ rules: 1, level: 1, seed: 104729, target: 16, configVersion: 1, directions: ["diagonal"] })).toThrow("方向序列")
  })

  it("空路径不能被当作正式第一关的通关证明", () => {
    expect(() => replaySolution({ rules: 1, level: 1, seed: 104729, target: 16, configVersion: 1, directions: [], expected: { score: 0, moves: 0, maximum: 16, random: 1, board: Array<number>(16).fill(0) } })).toThrow("未能通关")
  })

  it("回放中的步数上限变化后，需要重新生成路径", () => {
    const level = getLevel(4)
    expect(() => replaySolution({ rules: 1, level: level.id, seed: level.seed, target: level.target, configVersion: level.version, maxMoves: level.maxMoves! + 1, directions: [] })).toThrow("配置已变化")
  })

  it("不能把超过步数上限的局面导出成通关证明", () => {
    const session = { ...createSession(4), status: "won" as const, moves: getLevel(4).maxMoves! + 1, tiles: [{ id: 1, value: 64, position: 0 }, { id: 2, value: 2, position: 1 }] }
    expect(() => recordReplay(session, [])).toThrow("只能记录")
  })

  it.each([undefined, 0, -1, 1.5, 0x100000000])("拒绝不合法的回放种子 %s", seed => {
    expect(() => replaySolution({ rules: 1, level: 1, seed, target: 16, configVersion: 1 })).toThrow("种子")
  })

  it("记录真实开局种子，并拒绝脱离这个开局伪造的通关路径", () => {
    const session = { ...createSession(1, 65536), status: "won" as const, moves: 1, score: 16, tiles: [{ id: 1, value: 16, position: 0 }, { id: 2, value: 2, position: 1 }] }
    const replay = recordReplay(session, ["left"])
    expect(replay.seed).toBe(65536)
    expect(replay.seed).not.toBe(getLevel(1).seed)
    expect(() => replaySolution(replay)).toThrow("路径未能通关")
  })
})
