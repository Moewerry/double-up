import { afterEach, describe, expect, it, vi } from "vitest"
import { createSession, move, undo } from "@/game/engine"
import type { Direction } from "@/game/types"
import { decodeSave, emptySave, loadSave, persist } from "./storage"

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
    expect(restored.notice).not.toBe("")
    expect(restored.saveStatus).toBe("ready")
  })

  it.each(["position", "id"] as const)("拒绝重复的方块 $0", key => {
    const save = emptySave()
    save.session.tiles[1][key] = save.session.tiles[0][key]
    expect(decodeSave(JSON.stringify(save)).notice).not.toBe("")
  })

  it("拒绝数组伪装的状态字段，以及跳到未解锁关卡的存档", () => {
    const save = emptySave()
    expect(decodeSave(JSON.stringify({ ...save, session: { ...save.session, status: ["playing"] } })).notice).not.toBe("")
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
