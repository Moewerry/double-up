import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { decodeSave, emptySave, SAVE_KEY } from "@/lib/storage"
import { createSession } from "@/game/engine"
import { getLevel } from "@/game/levels"

vi.mock("@/game/levels", () => import("@/game/legacy-levels.fixture"))

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
    store.getState().start()
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

  it("限步失败会保存结果，但不会解锁下一关", async () => {
    const { store, setItem } = await setup()
    const save = emptySave()
    save.records = { "1": { score: 32, moves: 12 }, "2": { score: 80, moves: 20 }, "3": { score: 200, moves: 35 } }
    save.session = { ...createSession(4), moves: getLevel(4).maxMoves! - 1, tiles: [{ id: 1, value: 2, position: 0 }, { id: 2, value: 2, position: 1 }] }
    store.setState({ data: save })
    expect(store.getState().move("left")).toBe(true)
    expect(store.getState().data.session.status).toBe("lost")
    expect(store.getState().data.records["4"]).toBeUndefined()
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(JSON.parse(setItem.mock.calls[0][1]).session.status).toBe("lost")
    store.getState().next()
    expect(store.getState().data.session.level).toBe(4)
  })

  it("旧不限步数纪录保留解锁资格，新限步纪录按当前版本重新计算", async () => {
    const { store } = await setup()
    const save = emptySave()
    save.records = Object.fromEntries([1, 2, 3, 4, 5].map(level => [String(level), { score: 2048, moves: 3 }]))
    save.session = { ...createSession(5), moves: getLevel(5).maxMoves! - 1, tiles: [{ id: 1, value: 32, position: 0 }, { id: 2, value: 32, position: 1 }] }
    store.setState({ data: save })
    store.getState().move("left")
    expect(store.getState().data.session.status).toBe("won")
    expect(store.getState().data.records["4"]).toEqual(save.records["4"])
    expect(store.getState().data.records["5"]).toEqual({ score: 64, moves: getLevel(5).maxMoves, configVersion: getLevel(5).version })
    expect(store.getState().clearFeedback).toEqual({ firstClear: true, bestScore: false, fewestMoves: false })
  })

  it("进入关卡就保存零步开局，重复进入或刷新不重新抽样", async () => {
    const getRandomValues = vi.fn((values: Uint32Array) => { values[0] = 1; return values })
    vi.stubGlobal("crypto", { getRandomValues })
    const { store, setItem } = await setup()
    const initial = structuredClone(store.getState().data)
    expect(setItem).not.toHaveBeenCalled()
    store.getState().start()
    store.getState().start()
    expect(setItem).toHaveBeenCalledTimes(1)
    expect(getRandomValues).toHaveBeenCalledTimes(1)
    getRandomValues.mockClear()
    expect(decodeSave(setItem.mock.calls[0][1]).data).toEqual(initial)
    expect(getRandomValues).not.toHaveBeenCalled()
  })

  it("重新开始随机生成开局，恢复全部步数并保留通关记录", async () => {
    const seeds = [1, 65536]
    vi.stubGlobal("crypto", { getRandomValues: (values: Uint32Array) => { values[0] = seeds.shift()!; return values } })
    const { store, setItem } = await setup()
    const save = store.getState().data
    const records = { "1": { score: 32, moves: 12 }, "2": { score: 80, moves: 20 }, "3": { score: 200, moves: 35 } }
    store.setState({ data: { ...save, records, session: { ...createSession(4, 1), moves: 20, score: 48, undoUsed: true } } })
    store.getState().restart()
    const restarted = store.getState().data.session
    expect(restarted).toMatchObject({ level: 4, seed: 65536, moves: 0, score: 0, status: "playing", undoUsed: false, previous: null })
    expect(restarted.tiles[0].position).toBe(2)
    expect(store.getState().data.records).toEqual(records)
    expect(JSON.parse(setItem.mock.calls[0][1]).session).toEqual(restarted)
  })

  it("确认清空后同时重置已保存数据、设置与临时状态，并解除存档阻塞", async () => {
    const { store, setItem } = await setup()
    const save = nearWin()
    save.sound = true
    save.music = true
    save.directions = true
    save.records = { "1": { score: 128, moves: 2 } }
    store.setState({ data: save, blocked: true, notice: "存档已更新", gained: 16, revision: 7, motions: [{ tile: save.session.tiles[0], destination: 0, merged: true }], clearFeedback: { firstClear: true, bestScore: false, fewestMoves: false } })
    expect(store.getState().clearData()).toBe(true)
    const reset = store.getState()
    expect(reset.data.records).toEqual({})
    expect(reset.data).toMatchObject({ records: {}, sound: false, music: false, directions: false, session: { level: 1, moves: 0, score: 0, previous: null, undoUsed: false } })
    expect(reset).toMatchObject({ blocked: false, notice: "", saveStatus: "saved", gained: 0, revision: 8, motions: [], clearFeedback: null })
    expect(JSON.parse(setItem.mock.calls[0][1])).toEqual(reset.data)
    expect(decodeSave(setItem.mock.calls[0][1]).data).toEqual(reset.data)
  })

  it("清空写入失败时保留已有进度，重试成功后再完成重置", async () => {
    const { store, setItem } = await setup()
    store.setState({ data: nearWin() })
    const previous = store.getState()
    setItem.mockImplementationOnce(() => { throw new Error("quota") })
    expect(store.getState().clearData()).toBe(false)
    expect(store.getState()).toBe(previous)
    expect(store.getState().clearData()).toBe(true)
    expect(store.getState().data.session.moves).toBe(0)
    expect(store.getState().data.records).toEqual({})
  })
})
