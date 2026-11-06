import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Board } from "@/components/game/board"
import { GameLayout } from "@/components/game/game-layout"
import { KeyboardGuideDialog } from "@/components/game/keyboard-guide-dialog"
import { RestartDialog } from "@/components/game/restart-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { TutorialActions } from "@/components/tutorial/tutorial-actions"
import { TutorialGesture } from "@/components/tutorial/tutorial-gesture"
import { TutorialPanel } from "@/components/tutorial/tutorial-panel"
import { Button } from "@/components/ui/button"
import { getLevel } from "@/game/levels"
import { tutorialSteps } from "@/game/tutorial"
import { useTutorial } from "@/hooks/use-tutorial"

export function TutorialPage() {
  const [guide, setGuide] = useState(false)
  const [settings, setSettings] = useState(false)
  const [restart, setRestart] = useState(false)
  const enabled = !guide && !settings && !restart
  const tutorial = useTutorial(enabled)
  const { state, busy } = tutorial
  const lesson = tutorialSteps[state.step]
  const playing = state.phase === "playing"
  const target = getLevel(1).target
  function reset() { tutorial.reset(); setRestart(false) }

  return <>
    <GameLayout summaryLabel="教程引导" boardLabel="教程棋盘" actionsLabel="教程操作" header={<header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <Button variant="ghost" size="icon" className="size-11 justify-self-start rounded-full" asChild><Link to="/" aria-label="返回首页"><ArrowLeft aria-hidden /></Link></Button>
      <h1 aria-label={`本关目标数字 ${target}`} className="text-4xl font-extrabold leading-none tracking-tight text-[#a95233] tabular-nums lg:text-5xl">{target}</h1>
      <div className="flex items-center gap-1 justify-self-end">
        <KeyboardGuideDialog onOpenChange={setGuide} />
        <SettingsDialog onOpenChange={setSettings} onRestart={() => { tutorial.clear(); setRestart(true) }} />
      </div>
    </header>}
      summary={<TutorialPanel state={state} />}
      actions={<TutorialActions state={state} busy={busy} onNext={tutorial.next} onReset={tutorial.reset} onStartOver={tutorial.startOver} />}>
      <div className="relative">
        <Board session={state.session} motions={state.motions} revision={state.revision} onMove={tutorial.submit} enabled={enabled} highlightedPositions={playing ? lesson.highlight : []} />
        {enabled && playing && lesson.direction && <TutorialGesture key={lesson.id} direction={lesson.direction} hint={state.hint} />}
      </div>
      <p id="board-help" className="sr-only">{lesson.direction ? `本步请向${({ left: "左", up: "上", right: "右", down: "下" } as const)[lesson.direction]}滑动棋盘。` : `自由移动，合成 ${target}。`}也可以使用方向键或 WASD。{state.phase === "passed" ? "本步已完成，可以继续。" : ""}</p>
    </GameLayout>
    <RestartDialog open={restart} onOpenChange={setRestart} onRestart={reset} blocked={false} title="重试这一步？" description={lesson.kind === "free" ? "随机生成新的棋盘。" : "恢复这一步的初始棋盘。"} />
  </>
}
