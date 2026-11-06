import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { createSession, move } from "../src/game/engine"
import { levels } from "../src/game/levels"
import { boardValues, recordReplay, replaySolution } from "../src/game/replay"
import type { LevelReplay } from "../src/game/replay"
import type { Direction, Session } from "../src/game/types"

const directions: Direction[] = ["left", "down", "right", "up"]
const beamWidth = 96
const maximumDepth = 600
const maximumExpansions = 200000
const output = new URL("./level-replays.json", import.meta.url)
interface Candidate { session: Session; path: Direction[]; rank: number }

function rank(session: Session): number {
  const board = boardValues(session)
  const maximum = Math.max(...board)
  let adjacent = 0, roughness = 0
  for (let position = 0; position < 16; position++) {
    for (const neighbor of [position % 4 < 3 ? position + 1 : -1, position < 12 ? position + 4 : -1]) {
      if (neighbor < 0 || !board[position] || !board[neighbor]) continue
      if (board[position] === board[neighbor]) adjacent += Math.log2(board[position])
      roughness += Math.abs(Math.log2(board[position]) - Math.log2(board[neighbor]))
    }
  }
  const cornerBonus = [0, 3, 12, 15].some(position => board[position] === maximum) ? 40 : 0
  return Math.log2(maximum) * 200 + board.filter(value => !value).length * 48 + adjacent * 12 + cornerBonus - roughness * 3
}

function findPath(initial: Session): Candidate | null {
  let frontier: Candidate[] = [{ session: initial, path: [], rank: 0 }]
  let expansions = 0
  for (let depth = 0; depth < maximumDepth && frontier.length; depth++) {
    const candidates = new Map<string, Candidate>()
    for (const candidate of frontier) {
      for (const direction of directions) {
        if (expansions++ >= maximumExpansions) return null
        const session = move(candidate.session, direction).session
        if (session === candidate.session || session.status === "lost") continue
        const next = { session, path: [...candidate.path, direction], rank: rank(session) }
        if (session.status === "won") return next
        const key = `${session.random}:${boardValues(session).join(",")}`
        const previous = candidates.get(key)
        if (!previous || previous.session.score < session.score) candidates.set(key, next)
      }
    }
    frontier = [...candidates.values()].sort((a, b) => b.rank - a.rank || b.session.score - a.session.score).slice(0, beamWidth)
  }
  return null
}

async function main() {
  const arguments_ = process.argv.slice(2)
  if (arguments_.some(argument => argument !== "--write" && argument !== "--replay") || arguments_.includes("--write") && arguments_.includes("--replay")) throw new Error("用法：npm run levels:verify [-- --write]，或 npm run levels:replay。")
  if (arguments_.includes("--replay")) {
    let contents: string
    try { contents = await readFile(output, "utf8") } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") throw new Error("尚无通关回放文件。请先执行 npm run levels:verify -- --write。")
      throw error
    }
    const data: unknown = JSON.parse(contents)
    if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1 || !("replays" in data) || !Array.isArray(data.replays) || data.replays.length !== levels.length) throw new Error("回放文件必须完整覆盖当前开放关卡。")
    for (const [index, replay] of data.replays.entries()) {
      const session = replaySolution(replay)
      if (session.level !== levels[index].id) throw new Error("回放关卡顺序不正确或重复。")
      console.log(`第 ${session.level} 关回放通过：开局种子 ${session.seed}，${session.moves} 步，${session.score} 分。`)
    }
    return
  }

  const replays: LevelReplay[] = []
  for (const level of levels) {
    const initial = createSession(level.id)
    const result = findPath(initial)
    if (!result) throw new Error(`第 ${level.id} 关的随机开局（种子 ${initial.seed}）在搜索预算内未找到路径。这不证明无解；已停止，不会改写已有回放文件。`)
    const replay = recordReplay(result.session, result.path)
    replaySolution(replay)
    replays.push(replay)
    console.log(`第 ${level.id} 关找到样本路径并回放通过：开局种子 ${replay.seed}，${replay.expected.moves} 步，${replay.expected.score} 分，最大方块 ${replay.expected.maximum}。`)
  }
  if (arguments_.includes("--write")) {
    await writeFile(output, JSON.stringify({ version: 1, replays }, null, 2) + "\n", "utf8")
    console.log(`样本通关路径已写入 ${fileURLToPath(output)}。这仅证明这些随机开局中的路径可通关，不代表所有随机开局或所有走法都能通关，仍需多样本验证和人工试玩。`)
  } else {
    console.log(JSON.stringify({ version: 1, replays }, null, 2))
    console.log("未写入文件。如需保留已找到的路径，请使用 --write。")
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "关卡验证失败。")
  process.exitCode = 1
})
