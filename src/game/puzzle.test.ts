import { describe, expect, it } from "vitest"
import { createSession, move, undo } from "./engine"
import { getLevel, levels } from "./levels"
import { recordReplay, replaySolution } from "./replay"
import { decodeSave, emptySave } from "@/lib/storage"
import { getStatus } from "./rules"
import type { Session } from "./types"

function savedSession(session: Session) {
  const save = emptySave()
  for (const level of levels.filter(level => level.id < session.level)) {
    save.records[String(level.id)] = { score: 0, moves: 1, configVersion: level.version }
  }
  if (session.status === "won") save.records[String(session.level)] = { score: session.score, moves: session.moves, configVersion: session.configVersion }
  save.session = session
  return save
}

describe("第一章固定解谜关卡", () => {
  it("完整配置三十关，关卡编号连续", () => {
    expect(levels).toHaveLength(30)
    expect(levels.map(level => level.id)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1))
  })

  it.each(levels)("第 $id 关「$title」布局合法，参考解法通过且逐步存档可恢复", level => {
    const puzzle = level.puzzle!
    const terrain = [...puzzle.walls, ...puzzle.doors.map(door => door.position), ...puzzle.fragile]
    expect(new Set(terrain).size).toBe(terrain.length)
    expect(terrain.every(position => Number.isInteger(position) && position >= 0 && position < 16)).toBe(true)
    expect(new Set(puzzle.initialTiles.map(tile => tile.position)).size).toBe(puzzle.initialTiles.length)
    for (const tile of puzzle.initialTiles) {
      expect(Number.isInteger(Math.log2(tile.value))).toBe(true)
      expect(puzzle.walls).not.toContain(tile.position)
      expect(puzzle.doors.some(door => door.position === tile.position)).toBe(false)
    }
    let session = createSession(level.id)
    expect(createSession(level.id)).toEqual(session)
    expect(session.status).toBe("playing")
    for (const direction of puzzle.solution) {
      const previous = structuredClone(session)
      const next = move(session, direction).session
      expect(session).toEqual(previous)
      expect(next).not.toBe(session)
      expect(next.random).toBe(session.random)
      expect(next.tiles.length).toBeLessThanOrEqual(session.tiles.length)
      session = next
      const save = savedSession(session)
      expect(decodeSave(JSON.stringify(save))).toMatchObject({ data: save, notice: "", blocked: false })
    }
    expect(session.status).toBe("won")
    expect(replaySolution(recordReplay(session, [...puzzle.solution]))).toEqual(session)
  })

  it("新合成的钥匙停在门前，下一次滑动才消耗钥匙开门", () => {
    const initial = createSession(16)
    const merged = move(initial, "right").session
    expect(merged.tiles).toMatchObject([{ value: 8, position: 5 }])
    expect(merged.openedDoors).toEqual([])
    expect(merged.status).toBe("playing")
    const opened = move(merged, "right").session
    expect(opened.openedDoors).toEqual([6])
    expect(opened.tiles).toEqual([])
    expect(opened.status).toBe("won")
    expect(decodeSave(JSON.stringify(savedSession(opened))).data.session).toEqual(opened)
  })

  it("刚打开的门从下一次滑动开始可以通行，撤销会恢复门与钥匙", () => {
    const initial = createSession(18)
    const merged = move(initial, "right").session
    const opened = move(merged, "right").session
    expect(opened.tiles).toMatchObject([{ value: 4, position: 9 }])
    expect(opened.status).toBe("playing")
    const restored = undo(opened)
    expect(restored.openedDoors).toEqual([])
    expect(restored.tiles).toEqual(merged.tiles)
    expect(move(restored, "right").session.openedDoors).toEqual(opened.openedDoors)
  })

  it("同一次滑动中，后面的数字停在刚打开的门前", () => {
    const state: Session = { ...createSession(18), tiles: [{ id: 1, value: 8, position: 5 }, { id: 2, value: 4, position: 4 }], nextId: 3 }
    const opened = move(state, "right").session
    expect(opened.openedDoors).toEqual([6])
    expect(opened.tiles).toMatchObject([{ value: 4, position: 5 }])
    expect(opened.status).toBe("playing")
    expect(move(opened, "right").session.status).toBe("won")
  })

  it("数字达到目标但尚未送达时继续游玩，终点不接受更大的数字", () => {
    const initial = createSession(11)
    expect(getStatus(initial, getLevel(11))).toBe("playing")
    const delivered = move(initial, "right").session
    expect(delivered.status).toBe("won")
    expect(getStatus({ ...delivered, tiles: [{ id: 1, value: 8, position: 7 }] }, getLevel(11))).toBe("lost")
  })

  it("跨过和离开的一次性地板都会坍塌，停在地板上时保持完整", () => {
    let session = createSession(25)
    session = move(move(session, "right").session, "right").session
    const down = move(session, "down").session
    expect(down.collapsedCells).toEqual([7])
    expect(down.tiles).toMatchObject([{ value: 8, position: 11 }])
    expect(undo(down).collapsedCells).toEqual([])
    const left = move(down, "left").session
    expect(left.collapsedCells).toEqual([7, 11])
    expect(left.status).toBe("won")
  })

  it("把钥匙和运输数字合成 16 后，无法拆回两个 8，会判定失败", () => {
    const aligned = move(createSession(30), "up").session
    const wrongMerge = move(aligned, "left").session
    expect(wrongMerge.tiles).toMatchObject([{ value: 16, position: 4 }])
    expect(wrongMerge.status).toBe("lost")
  })

  it("坍塌后无法穿过，墙后有空位也不能误判为能移动", () => {
    const state = { ...createSession(22), tiles: [{ id: 1, value: 4, position: 4 }], nextId: 2, collapsedCells: [5] }
    expect(move(state, "right").session).toBe(state)
  })

  it("一次性通道提前坍塌，把两个数字永久隔开时判负", () => {
    const crossedTooEarly = move(createSession(22), "right").session
    expect(crossedTooEarly.collapsedCells).toEqual([5])
    expect(crossedTooEarly.status).toBe("lost")
    expect(move(crossedTooEarly, "left").session).toBe(crossedTooEarly)
  })

  it("损坏机关状态会重开本关，旧配置保留通关进度和设置", () => {
    const session = createSession(18)
    const save = savedSession(session)
    save.sound = true
    save.session = { ...session, openedDoors: [0] }
    const damaged = decodeSave(JSON.stringify(save))
    expect(damaged.notice).toBe("")
    expect(damaged.data.session).toEqual(session)
    expect(damaged.data.records).toEqual(save.records)
    expect(damaged.data.sound).toBe(true)
    save.session = { ...session, configVersion: 1 }
    expect(decodeSave(JSON.stringify(save)).data.session).toEqual(session)
  })

  it("回放必须校验机关状态，不能只匹配数字棋盘", () => {
    let session = createSession(30)
    for (const direction of getLevel(30).puzzle!.solution) session = move(session, direction).session
    const replay = recordReplay(session, [...getLevel(30).puzzle!.solution])
    replay.expected.collapsedCells = []
    expect(() => replaySolution(replay)).toThrow("机关状态")
  })

  it("旧版五关通关后从新版第一关学习新机制，保留历史记录与设置", () => {
    const save = emptySave()
    save.music = true
    save.records = Object.fromEntries([1, 2, 3, 4, 5].map(id => [String(id), { score: 128, moves: 20 }]))
    save.session = { ...createSession(5), configVersion: 2 }
    const restored = decodeSave(JSON.stringify(save))
    expect(restored.data.session).toEqual(createSession(1))
    expect(restored.data.records).toEqual(save.records)
    expect(restored.data.music).toBe(true)
  })
})
