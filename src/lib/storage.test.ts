import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createSession, move, undo } from "@/game/engine"
import { getLevel } from "@/game/levels"
import type { Direction } from "@/game/types"
import { decodeSave, emptySave, loadSave, persist } from "./storage"

vi.mock("@/game/levels", () => import("@/game/legacy-levels.fixture"))

beforeEach(() => vi.stubGlobal("crypto", { getRandomValues: vi.fn((values: Uint32Array) => { values[0] = 104729; return values }) }))
afterEach(() => vi.unstubAllGlobals())

describe("存档恢复", () => {
  it("首次游玩不声称已经保存，已存在的有效存档可恢复", () => {
    expect(decodeSave(null).saveStatus).toBe("ready")
    const save = emptySave()
    expect(decodeSave(JSON.stringify(save))).toMatchObject({ data: save, saveStatus: "saved", blocked: false, notice: "" })
  })

  it("损坏当前局面时保留有效通关记录，并停在下一待挑战关", () => {
    const save = { ...emptySave(), records: { "1": { score: 32, moves: 12 } }, session: { invalid: true } }
    const restored = decodeSave(JSON.stringify(save))
    expect(restored.data.records).toEqual(save.records)
    expect(restored.data.session).toEqual(createSession(2))
    expect(restored.notice).toBe("")
    expect(restored.saveStatus).toBe("ready")
  })

  it.each(["position", "id"] as const)("拒绝重复的方块 $0", key => {
    const save = emptySave()
    save.session.tiles[1][key] = save.session.tiles[0][key]
    expect(decodeSave(JSON.stringify(save)).notice).toBe("")
  })

  it("拒绝数组伪装的状态字段，以及跳到未解锁关卡的存档", () => {
    const save = emptySave()
    expect(decodeSave(JSON.stringify({ ...save, session: { ...save.session, status: ["playing"] } })).notice).toBe("")
    expect(decodeSave(JSON.stringify({ ...save, session: createSession(5) })).data.session.level).toBe(1)
  })

  it("未知版本暂停输入，不自动写入浏览器", () => {
    const setItem = vi.fn()
    const raw = JSON.stringify({ ...emptySave(), version: 99 })
    vi.stubGlobal("localStorage", { getItem: () => raw, setItem })
    const restored = loadSave()
    expect(restored.blocked).toBe(true)
    expect(restored.notice).toContain("版本不兼容")
    expect(setItem).not.toHaveBeenCalled()
  })

  it("刷新后不能恢复已经用掉的撤销次数", () => {
    const save = emptySave()
    const directions: Direction[] = ["left", "right", "up", "down"]
    const first = directions.map(direction => move(save.session, direction).session).find(session => session !== save.session)!
    save.session = undo(first)
    const restored = decodeSave(JSON.stringify(save))
    expect(restored.notice).toBe("")
    expect(restored.data.session.undoUsed).toBe(true)
    expect(undo(restored.data.session)).toBe(restored.data.session)
  })

  it("存储读取或写入失败时返回不可用状态", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked") }, setItem: () => { throw new Error("quota") } })
    expect(loadSave().saveStatus).toBe("unavailable")
    expect(persist(emptySave())).toBe(false)
  })

  it("损坏 JSON 可以恢复到新局，且不混淆为存储不可用", () => {
    const result = decodeSave("{broken")
    expect(result.data.session.level).toBe(1)
    expect(result.saveStatus).toBe("ready")
    expect(result.notice).not.toBe("")
  })
})

function fourthLevelSave() {
  const save = emptySave()
  save.records = { "1": { score: 32, moves: 12 }, "2": { score: 80, moves: 20 }, "3": { score: 200, moves: 35 } }
  save.session = createSession(4)
  return save
}

describe("限步存档兼容", () => {
  it("可以恢复步数耗尽的失败局面，而不是将它当成损坏存档", () => {
    const save = fourthLevelSave()
    save.session.moves = getLevel(4).maxMoves!
    save.session.status = "lost"
    const restored = decodeSave(JSON.stringify(save))
    expect(restored.notice).toBe("")
    expect(restored.data.session).toEqual(save.session)
  })

  it("拒绝步数耗尽后仍声称进行中的局面，以及超过上限的局面", () => {
    for (const extra of [0, 1]) {
      const save = fourthLevelSave()
      save.session.moves = getLevel(4).maxMoves! + extra
      save.session.status = extra ? "lost" : "playing"
      const restored = decodeSave(JSON.stringify(save))
      expect(restored.notice).toBe("")
      expect(restored.data.session).toEqual(createSession(4))
      expect(restored.data.records).toEqual(save.records)
    }
  })

  it("旧配置只重开当前受影响的关卡，保留已完成关卡与设置", () => {
    const save = fourthLevelSave()
    save.session.configVersion = 1
    save.sound = true
    const restored = decodeSave(JSON.stringify(save))
    expect(restored.notice).toBe("")
    expect(restored.data.session).toEqual(createSession(4))
    expect(restored.data.records).toEqual(save.records)
    expect(restored.data.sound).toBe(true)
  })

  it("最后一步通关后的新版本纪录和前一步快照可以完整恢复", () => {
    const save = fourthLevelSave()
    save.session.moves = getLevel(4).maxMoves! - 1
    save.session.tiles = [{ id: 1, value: 32, position: 0 }, { id: 2, value: 32, position: 1 }]
    save.session = move(save.session, "left").session
    save.records["4"] = { score: save.session.score, moves: save.session.moves, configVersion: save.session.configVersion }
    const restored = decodeSave(JSON.stringify(save))
    expect(restored.notice).toBe("")
    expect(restored.data).toEqual(save)
    expect(restored.data.session.status).toBe("won")
  })

  it("新版胜局不能用旧版成绩充当通关纪录，历史解锁资格仍保留", () => {
    const save = fourthLevelSave()
    save.session.status = "won"
    save.session.moves = 30
    save.session.score = 64
    save.session.tiles = [{ id: 1, value: 64, position: 0 }, { id: 2, value: 2, position: 1 }]
    save.records["4"] = { score: 1024, moves: 50 }
    const restored = decodeSave(JSON.stringify(save))
    expect(restored.notice).toBe("")
    expect(restored.data.session).toEqual(createSession(5))
    expect(restored.data.records).toEqual(save.records)
  })
})

describe("随机种子存档", () => {
  it("刷新恢复保存的开局与随机流，包括还未移动的新局，不重新抽样", () => {
    const save = emptySave()
    const getRandomValues = vi.mocked(globalThis.crypto.getRandomValues)
    getRandomValues.mockClear()
    expect(decodeSave(JSON.stringify(save)).data).toEqual(save)
    expect(getRandomValues).not.toHaveBeenCalled()
  })

  it("旧存档补齐历史种子，不改变已有数字位置或随机流", () => {
    const { seed: _seed, ...legacySession } = createSession(2, getLevel(2).seed)
    const save = { ...emptySave(), records: { "1": { score: 32, moves: 12 } }, session: legacySession }
    const restored = decodeSave(JSON.stringify(save))
    expect(restored.notice).toBe("")
    expect(restored.data.session).toEqual({ ...legacySession, seed: getLevel(2).seed })
    expect(restored.data.records).toEqual(save.records)
  })

  it.each([0, -1, 1.5, 0x100000000])("损坏的开局种子 %s 会重新准备本关", seed => {
    const save = emptySave()
    const restored = decodeSave(JSON.stringify({ ...save, session: { ...save.session, seed } }))
    expect(restored.notice).toBe("")
    expect(restored.data.session).toEqual(createSession(1))
  })
})
