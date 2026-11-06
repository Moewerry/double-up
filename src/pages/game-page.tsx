import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsDialog } from "@/components/settings-dialog"
import { Board } from "@/components/game/board"
import { GameControls } from "@/components/game/game-controls"
import { DirectionControls } from "@/components/game/direction-controls"
import { ResultDialog } from "@/components/game/result-dialog"
import { ScorePanel } from "@/components/game/score-panel"
import { RestartDialog } from "@/components/game/restart-dialog"
import { MoveFeedback } from "@/components/game/move-feedback"
import { getLevel } from "@/game/levels"
import { useGameStore } from "@/stores/use-game-store"
import { useGameInput } from "@/hooks/use-game-input"

export function GamePage() {
  const store = useGameStore(), navigate = useNavigate()
  const { session } = store.data
  const level = getLevel(session.level)
  const [result, setResult] = useState(session.status !== "playing")
  const [restart, setRestart] = useState(false)
  const [settings, setSettings] = useState(false)
  const resultButton = useRef<HTMLButtonElement>(null)
  const enabled = !store.blocked && !result && !restart && !settings && session.status === "playing"
  const { submit, clear, feedback } = useGameInput(enabled)
  useEffect(() => { if (session.status !== "playing") setResult(true) }, [session.status, session.level])
  function reset() { clear(); store.restart(); setRestart(false); setResult(false) }
  function undo() { clear(); store.undo(); setResult(false) }
  return <div className="mx-auto w-full max-w-[480px] lg:max-w-none">
    <header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <Button variant="ghost" className="-ml-3 h-11 justify-self-start rounded-xl" asChild><Link to="/"><ArrowLeft />首页</Link></Button>
      <h1 aria-label={`本关目标数字 ${level.target}`} className="text-4xl font-extrabold leading-none tracking-tight text-[#a95233] tabular-nums lg:text-5xl">{level.target}</h1>
      <div className="flex items-center justify-self-end"><SettingsDialog onOpenChange={setSettings} /></div>
    </header>
    <div className="mx-auto lg:grid lg:max-w-[960px] lg:grid-cols-[minmax(0,480px)_minmax(0,360px)] lg:grid-rows-[auto_1fr] lg:justify-center lg:gap-x-16 lg:py-12">
      <section aria-label="本局成绩" className="flow-root min-w-0 lg:col-start-2 lg:row-start-1">
        <ScorePanel score={session.score} moves={session.moves} best={store.data.records[String(session.level)]?.score ?? 0} gained={store.gained} revision={store.revision} />
      </section>
      <section aria-label="游戏棋盘" className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <Board session={session} motions={store.motions} revision={store.revision} onMove={submit} enabled={enabled} />
        <p id="board-help" className="sr-only">使用方向键或 WASD 移动方块。触屏可以在棋盘上滑动。</p>
        <MoveFeedback session={session} message={feedback} />
      </section>
      <section aria-label="游戏操作" className="min-w-0 lg:col-start-2 lg:row-start-2">
        {session.status !== "playing" && <Button ref={resultButton} className="mt-4 h-11 w-full" onClick={() => setResult(true)}><Flag />查看{session.status === "won" ? "通关" : "挑战"}结果</Button>}
        <GameControls session={session} disabled={store.blocked} onUndo={undo} onRestart={() => { clear(); if (session.moves === 0) reset(); else setRestart(true) }} onDirections={() => store.toggle("directions")} directions={store.data.directions} />
        {store.data.directions && <DirectionControls onMove={submit} disabled={!enabled} />}
      </section>
    </div>
    {session.status !== "playing" && <ResultDialog session={session} open={result} onOpenChange={setResult} onRestoreFocus={() => (resultButton.current ?? document.getElementById("double-up-board"))?.focus({ preventScroll: true })} blocked={store.blocked} onNext={() => { clear(); store.next(); setResult(false) }} onRestart={reset} onUndo={undo} onHome={() => navigate("/")} />}
    <RestartDialog open={restart} onOpenChange={setRestart} onRestart={reset} blocked={store.blocked} />
  </div>
}
