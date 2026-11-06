import { describe, expect, it } from "vitest"
import { createSession } from "./engine"
import { getLevel } from "./levels"
import { recordReplay, replaySolution } from "./replay"

describe("正式配置通关回放的边界", () => {
  it("未通关或使用过撤销的局面不能导出成通关记录", () => {
    expect(() => recordReplay(createSession(1), [])).toThrow("只能记录")
    expect(() => recordReplay({ ...createSession(1), status: "won", undoUsed: true }, [])).toThrow("只能记录")
  })

  it("拒绝未知关卡、旧种子以及非法方向", () => {
    expect(() => replaySolution({ rules: 1, level: 99 })).toThrow("不存在")
    expect(() => replaySolution({ rules: 1, level: 1, seed: 1, target: 16, configVersion: 1 })).toThrow("配置已变化")
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
})
