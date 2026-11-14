import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Board } from "@/components/game/board"
import { GameLayout } from "@/components/game/game-layout"
import { TutorialActions } from "@/components/tutorial/tutorial-actions"
import { TutorialGesture } from "@/components/tutorial/tutorial-gesture"
import { TutorialPanel } from "@/components/tutorial/tutorial-panel"
import { Button } from "@/components/ui/button"
import { getLevel } from "@/game/levels"
import { tutorialSteps } from "@/game/tutorial"
import { useTutorial } from "@/hooks/use-tutorial"

export function TutorialPage() {
  const tutorial = useTutorial(true)
  const { state, busy } = tutorial
  const lesson = tutorialSteps[state.step]
  const playing = state.phase === "playing"
  const showSpotlight = state.step === 0 && state.phase === "passed" && !busy
  const target = getLevel(1).target

  return <>
    {showSpotlight && <div aria-hidden className="fixed inset-0 z-30 bg-black/50" />}
    <GameLayout actionsBelowBoard summaryLabel="教程引导" boardLabel="教程棋盘" actionsLabel="教程操作" header={<header inert={showSpotlight}>
      <Button variant="ghost" size="icon" className="size-11 rounded-full" asChild><Link to="/" aria-label="返回首页"><ArrowLeft aria-hidden /></Link></Button>
    </header>}
      summary={<TutorialPanel state={state} />}
      actions={playing ? null : <TutorialActions state={state} busy={busy} spotlight={showSpotlight} onNext={tutorial.next} onReset={tutorial.reset} onStartOver={tutorial.startOver} />}>
      <div className={showSpotlight ? "relative z-40" : "relative"}>
        <Board session={state.session} motions={state.motions} revision={state.revision} onMove={tutorial.submit} enabled highlightedPositions={playing ? lesson.highlight : []} />
        {playing && lesson.direction && <TutorialGesture key={lesson.id} direction={lesson.direction} hint={state.hint} />}
      </div>
      <p id="board-help" className="sr-only">{lesson.direction ? `本步请向${({ left: "左", up: "上", right: "右", down: "下" } as const)[lesson.direction]}滑动棋盘。` : `自由移动，合成 ${target}。`}也可以使用方向键或 WASD。{state.phase === "passed" ? "本步已完成，可以继续。" : ""}</p>
    </GameLayout>
  </>
}
