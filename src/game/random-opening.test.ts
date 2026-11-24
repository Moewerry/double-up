import { afterEach, describe, expect, it, vi } from "vitest"
import { createSession } from "./engine"
import { levels } from "./levels"

vi.mock("./levels", () => import("./legacy-levels.fixture"))

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe("随机开局", () => {
  it.each(levels)("第 $id 关的新局独立抽取种子，两个数字不会重叠", ({ id }) => {
    const seeds = [1, 65536]
    const getRandomValues = vi.fn((values: Uint32Array) => { values[0] = seeds.shift()!; return values })
    vi.stubGlobal("crypto", { getRandomValues })
    const first = createSession(id)
    const second = createSession(id)
    expect(first.seed).toBe(1)
    expect(second.seed).toBe(65536)
    expect(first.tiles[0].position).toBe(0)
    expect(second.tiles[0].position).toBe(2)
    expect(getRandomValues).toHaveBeenCalledTimes(2)
    for (const session of [first, second]) {
      expect(session.tiles).toHaveLength(2)
      expect(new Set(session.tiles.map(tile => tile.position)).size).toBe(2)
      expect(session.tiles.every(tile => tile.position >= 0 && tile.position < 16 && [2, 4].includes(tile.value))).toBe(true)
      expect(session).toMatchObject({ score: 0, moves: 0, status: "playing", undoUsed: false, previous: null })
    }
  })

  it("显式种子可以复现完整开局，并且不会额外抽取随机数", () => {
    const getRandomValues = vi.fn(() => { throw new Error("不应重新抽样") })
    vi.stubGlobal("crypto", { getRandomValues })
    expect(createSession(5, 205019)).toEqual(createSession(5, 205019))
    expect(getRandomValues).not.toHaveBeenCalled()
  })

  it.each([0, -1, 1.5, 0x100000000, NaN, Infinity])("拒绝无效的显式种子 %s", seed => {
    expect(() => createSession(1, seed)).toThrow("种子")
  })

  it("熵源返回零时使用非零种子，避免随机流卡死", () => {
    vi.stubGlobal("crypto", { getRandomValues: (values: Uint32Array) => { values[0] = 0; return values } })
    expect(createSession(1).seed).toBe(1)
  })

  it("没有 Web Crypto 时仍可生成有效的新局", () => {
    vi.stubGlobal("crypto", undefined)
    vi.spyOn(Math, "random").mockReturnValue(.5)
    const session = createSession(1)
    expect(session.seed).toBe(0x80000000)
    expect(new Set(session.tiles.map(tile => tile.position)).size).toBe(2)
  })
})
