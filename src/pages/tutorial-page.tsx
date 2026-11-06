import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Board } from "@/components/game/board"
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

  return <div className="mx-auto w-full max-w-[480px] pb-6 lg:max-w-none">
    <header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      <Button variant="ghost" className="-ml-3 h-11 justify-self-start rounded-xl" asChild><Link to="/"><ArrowLeft />首页</Link></Button>
      <h1 aria-label={`本关目标数字 ${target}`} className="text-4xl font-extrabold leading-none tracking-tight text-[#a95233] tabular-nums lg:text-5xl">{target}</h1>
      <div className="flex items-center gap-1 justify-self-end">
        <KeyboardGuideDialog onOpenChange={setGuide} />
        <SettingsDialog onOpenChange={setSettings} onRestart={() => { tutorial.clear(); setRestart(true) }} />
      </div>
    </header>
    <div className="mx-auto lg:grid lg:max-w-[960px] lg:grid-cols-[minmax(0,480px)_minmax(0,360px)] lg:grid-rows-[auto_1fr] lg:justify-center lg:gap-x-16 lg:py-12">
      <section aria-label="教程引导" className="min-w-0 lg:col-start-2 lg:row-start-1"><TutorialPanel state={state} /></section>
      <section aria-label="教程棋盘" className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <div className="relative mx-auto max-w-[420px] lg:max-w-[480px]">
          <Board session={state.session} motions={state.motions} revision={state.revision} onMove={tutorial.submit} enabled={enabled} highlightedPositions={playing ? lesson.highlight : []} />
          {enabled && playing && lesson.direction && <TutorialGesture key={lesson.id} direction={lesson.direction} hint={state.hint} />}
        </div>
        <p id="board-help" className="sr-only">{lesson.direction ? `本步请向${({ left: "左", up: "上", right: "右", down: "下" } as const)[lesson.direction]}滑动棋盘。` : `自由移动，合成 ${target}。`}也可以使用方向键或 WASD。{state.phase === "passed" ? "本步已完成，可以继续。" : ""}</p>
      </section>
      <section aria-label="教程操作" className="min-w-0 lg:col-start-2 lg:row-start-2"><TutorialActions state={state} busy={busy} onNext={tutorial.next} onReset={tutorial.reset} onStartOver={tutorial.startOver} /></section>
    </div>
    <RestartDialog open={restart} onOpenChange={setRestart} onRestart={reset} blocked={false} title="重试这一步？" description="恢复这一步的初始棋盘。" />
  </div>
}
