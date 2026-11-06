import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { SettingsDialog } from "@/components/settings-dialog"
import { SaveIndicator } from "@/components/save-indicator"
import { Board } from "@/components/game/board"
import { ScorePanel } from "@/components/game/score-panel"
import { GameControls } from "@/components/game/game-controls"
import { DirectionControls } from "@/components/game/direction-controls"
import { ResultDialog } from "@/components/game/result-dialog"
import { TargetProgress } from "@/components/game/target-progress"
import { MoveFeedback } from "@/components/game/move-feedback"
import { getLevel, levels } from "@/game/levels"
import { getLevelType } from "@/game/level-types"
import { useGameStore } from "@/stores/use-game-store"
import { useGameInput } from "@/hooks/use-game-input"

export function GamePage() {
  const store = useGameStore(), navigate = useNavigate()
  const { session } = store.data
  const level = getLevel(session.level)
  const levelType = getLevelType(level.type)
  const [result, setResult] = useState(session.status !== "playing")
  const [restart, setRestart] = useState(false)
  const [settings, setSettings] = useState(false)
  const resultButton = useRef<HTMLButtonElement>(null)
  const enabled = !store.blocked && !result && !restart && !settings && session.status === "playing"
  const { submit, clear, feedback } = useGameInput(enabled)
  useEffect(() => { if (session.status !== "playing") setResult(true) }, [session.status, session.level])
  function reset() { clear(); store.restart(); setRestart(false); setResult(false) }
  function undo() { clear(); store.undo(); setResult(false) }
  return <>
    <header className="flex items-center justify-between">
      <Button variant="ghost" className="h-11 -ml-3 rounded-xl" asChild><Link to="/"><ArrowLeft />首页</Link></Button>
      <span className="text-sm font-bold tracking-tight">doubleup<span className="text-[#a95233]">.</span></span>
      <SettingsDialog onOpenChange={setSettings} />
    </header>
    <div className="mt-7 flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#579478]" />初识数字 · {levelType.label}</span><span className="tabular-nums">{String(session.level).padStart(2, "0")} / {String(levels.length).padStart(2, "0")}</span></div>
    <Progress className="mt-3 h-1" value={(session.level - 1 + (store.data.records[String(session.level)] ? 1 : 0)) / levels.length * 100} aria-label={`当前第 ${session.level} 关`} />
    <section className="mt-7 text-center">
      <p className="text-xs tracking-[.16em] text-muted-foreground">LEVEL {String(session.level).padStart(2, "0")} · {level.title}</p>
      <h1 className="mt-3 flex items-baseline justify-center gap-3 text-2xl font-semibold">合成<span className="text-5xl font-extrabold tracking-tight text-[#a95233]">{level.target}</span></h1>
      <TargetProgress maximum={Math.max(...session.tiles.map(tile => tile.value))} target={level.target} />
    </section>
    <ScorePanel score={session.score} moves={session.moves} best={store.data.records[String(session.level)]?.score ?? 0} gained={store.gained} revision={store.revision} />
    <Board session={session} motions={store.motions} revision={store.revision} onMove={submit} enabled={enabled} />
    <p id="board-help" className="mt-5 text-center text-xs leading-6 text-muted-foreground">滑动棋盘，或使用方向键 / WASD · 不限步数</p>
    <MoveFeedback session={session} message={feedback} tip={level.tip} />
    {session.status !== "playing" && <Button ref={resultButton} className="mt-4 h-11 w-full" onClick={() => setResult(true)}><Flag />查看{session.status === "won" ? "通关" : "挑战"}结果</Button>}
    <GameControls session={session} disabled={store.blocked} onUndo={undo} onRestart={() => { clear(); if (session.moves === 0) reset(); else setRestart(true) }} onDirections={() => store.toggle("directions")} directions={store.data.directions} />
    {store.data.directions && <DirectionControls onMove={submit} disabled={!enabled} />}
    <footer className="py-7 text-center"><SaveIndicator /><p className="mt-2 text-[10px] tracking-wider text-muted-foreground">前 5 关开发预览 · 通关后继续下一关</p></footer>
    {session.status !== "playing" && <ResultDialog session={session} open={result} onOpenChange={setResult} onRestoreFocus={() => (resultButton.current ?? document.getElementById("double-up-board"))?.focus({ preventScroll: true })} blocked={store.blocked} onNext={() => { clear(); store.next(); setResult(false) }} onRestart={reset} onUndo={undo} onHome={() => navigate("/")} />}
    <Dialog open={restart} onOpenChange={setRestart}><DialogContent className="max-w-[400px] rounded-[20px]" onCloseAutoFocus={event => { event.preventDefault(); document.getElementById("double-up-board")?.focus({ preventScroll: true }) }}><DialogHeader><DialogTitle>从这一关重新开始？</DialogTitle><DialogDescription>本局分数和步数将重置，已有通关记录会保留。</DialogDescription></DialogHeader><div className="mt-2 flex gap-3"><Button className="h-11 flex-1" variant="outline" onClick={() => setRestart(false)}>继续这一局</Button><Button className="h-11 flex-1" onClick={reset} disabled={store.blocked}>重新开始</Button></div></DialogContent></Dialog>
  </>
}
