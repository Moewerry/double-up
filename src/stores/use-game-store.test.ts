import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { emptySave, SAVE_KEY } from "@/lib/storage"

beforeEach(() => vi.resetModules())
afterEach(() => vi.unstubAllGlobals())

async function setup(raw: string | null = null) {
  const setItem = vi.fn()
  vi.stubGlobal("localStorage", { getItem: () => raw, setItem })
  const { useGameStore } = await import("./use-game-store")
  return { store: useGameStore, setItem }
}

function nearWin() {
  const save = emptySave()
  save.session.tiles = [{ id: 1, value: 8, position: 0 }, { id: 2, value: 8, position: 1 }]
  return save
}

describe("进度与存档协调", () => {
  it("写入失败后重试成功，清除保存失败状态并保留当前局面", async () => {
    const { store, setItem } = await setup()
    setItem.mockImplementationOnce(() => { throw new Error("quota") })
    store.getState().toggle("sound")
    expect(store.getState().saveStatus).toBe("unavailable")
    const data = structuredClone(store.getState().data)
    store.getState().retrySave()
    expect(store.getState().saveStatus).toBe("saved")
    expect(store.getState().data).toEqual(data)
    expect(setItem).toHaveBeenLastCalledWith(SAVE_KEY, JSON.stringify(data))
  })

  it("未知版本和其他标签页改写后，不允许重试覆盖旧存档", async () => {
    const { store, setItem } = await setup(JSON.stringify({ ...emptySave(), version: 99 }))
    store.getState().retrySave()
    store.getState().toggle("sound")
    expect(store.getState().move("left")).toBe(false)
    expect(setItem).not.toHaveBeenCalled()
    store.getState().externalChange()
    store.getState().retrySave()
    expect(setItem).not.toHaveBeenCalled()
  })

  it("通关前禁止下一关；通关结果和纪录一次写入后才允许前进", async () => {
    const { store, setItem } = await setup()
    store.getState().next()
    expect(store.getState().data.session.level).toBe(1)
    expect(setItem).not.toHaveBeenCalled()
    store.setState({ data: nearWin() })
    store.getState().move("left")
    expect(setItem).toHaveBeenCalledTimes(1)
    const written = JSON.parse(setItem.mock.calls[0][1])
    expect(written.session.status).toBe("won")
    expect(written.records["1"]).toEqual({ score: 16, moves: 1 })
    expect(store.getState().clearFeedback?.firstClear).toBe(true)
    store.getState().next()
    expect(store.getState().data.session.level).toBe(2)
    expect(store.getState().data.records["1"]).toEqual({ score: 16, moves: 1 })
    expect(store.getState().clearFeedback).toBeNull()
  })

  it("最高分和最少步数分别更新，不把两次成绩混为一次", async () => {
    const { store } = await setup()
    const save = nearWin()
    save.records["1"] = { score: 128, moves: 20 }
    save.session.moves = 4
    store.setState({ data: save })
    store.getState().move("left")
    expect(store.getState().data.records["1"]).toEqual({ score: 128, moves: 5 })
    expect(store.getState().clearFeedback).toEqual({ firstClear: false, bestScore: false, fewestMoves: true })
  })
})
