import { ArrowRight, RotateCcw } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { tutorialComplete } from "@/game/tutorial"
import type { TutorialState } from "@/game/tutorial"

interface Props { state: TutorialState; busy: boolean; spotlight: boolean; onNext: () => void; onReset: () => void; onStartOver: () => void }

export function TutorialActions({ state, busy, spotlight, onNext, onReset, onStartOver }: Props) {
  if (state.phase === "playing") return null

  const complete = tutorialComplete(state)
  return <div className="space-y-2">
    {complete ? <>
      <Button className="h-12 w-full rounded-xl text-base font-bold" disabled={busy} asChild={!busy}>{busy ? <>继续<ArrowRight /></> : <Link to="/play">继续<ArrowRight /></Link>}</Button>
      <Button variant="ghost" className="h-11 w-full rounded-xl" disabled={busy} onClick={onStartOver}><RotateCcw />再练一次</Button>
    </> : state.phase === "lost" ? <Button className="h-12 w-full rounded-xl text-base font-bold" disabled={busy} onClick={onReset}><RotateCcw />再试试</Button>
      : <Button className={`h-12 w-full rounded-xl text-base font-bold${spotlight ? " relative z-40" : ""}`} disabled={busy} onClick={onNext}>继续<ArrowRight /></Button>}
  </div>
}
