import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { createSession, move } from "../src/game/engine"
import { levels } from "../src/game/levels"
import { recordReplay, replaySolution } from "../src/game/replay"
import type { LevelReplay } from "../src/game/replay"

const output = new URL("./level-replays.json", import.meta.url)

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
      console.log(`第 ${session.level} 关回放通过，${session.moves} 步，${session.score} 分。`)
    }
    return
  }

  const replays: LevelReplay[] = []
  for (const level of levels) {
    if (!level.puzzle?.solution.length) throw new Error(`第 ${level.id} 关缺少参考解法。`)
    let session = createSession(level.id)
    for (const [index, direction] of level.puzzle.solution.entries()) {
      if (session.status !== "playing") throw new Error(`第 ${level.id} 关在参考解法第 ${index + 1} 步之前已经结束。`)
      const next = move(session, direction).session
      if (next === session) throw new Error(`第 ${level.id} 关参考解法第 ${index + 1} 步无法移动。`)
      session = next
    }
    if (session.status !== "won") throw new Error(`第 ${level.id} 关参考解法未能通关。已停止，不会改写已有回放文件。`)
    const replay = recordReplay(session, [...level.puzzle.solution])
    replaySolution(replay)
    replays.push(replay)
    console.log(`第 ${level.id} 关「${level.title}」参考解法通过，${session.moves} 步，${session.score} 分。`)
  }
  if (arguments_.includes("--write")) {
    await writeFile(output, JSON.stringify({ version: 1, replays }, null, 2) + "\n", "utf8")
    console.log(`全部 ${levels.length} 关回放已写入 ${fileURLToPath(output)}。参考解法通过不代表难度已经经过人工试玩验证。`)
  } else {
    console.log(JSON.stringify({ version: 1, replays }, null, 2))
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "关卡验证失败。")
  process.exitCode = 1
})
