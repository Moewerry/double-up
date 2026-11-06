import { ArrowRight, RotateCcw } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { tutorialComplete } from "@/game/tutorial"
import type { TutorialState } from "@/game/tutorial"

interface Props { state: TutorialState; busy: boolean; onNext: () => void; onReset: () => void; onStartOver: () => void }

export function TutorialActions({ state, busy, onNext, onReset, onStartOver }: Props) {
  const complete = tutorialComplete(state)
  return <div className="space-y-2">
    {complete ? <>
      <Button className="h-12 w-full rounded-xl text-base font-bold" disabled={busy} asChild={!busy}>{busy ? <span>去闯关</span> : <Link to="/play">去闯关<ArrowRight /></Link>}</Button>
      <Button variant="ghost" className="h-11 w-full rounded-xl" disabled={busy} onClick={onStartOver}><RotateCcw />再练一次</Button>
    </> : state.phase === "lost" ? <Button className="h-12 w-full rounded-xl text-base font-bold" disabled={busy} onClick={onReset}><RotateCcw />再试试</Button>
      : <Button className="h-12 w-full rounded-xl text-base font-bold" disabled={busy || state.phase !== "passed"} onClick={onNext}>{state.phase === "passed" ? "继续" : "完成这一步"}<ArrowRight /></Button>}
  </div>
}
