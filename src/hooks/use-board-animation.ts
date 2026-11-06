import { useLayoutEffect, useRef, useState } from "react"
import { MOVE_DURATION } from "@/game/animation"
import { useReducedMotion } from "./use-reduced-motion"

export function useBoardAnimation(revision: number, hasMotions: boolean, enabled: boolean) {
  const previousRevision = useRef(revision)
  const animatedRevision = useRef<number | null>(null)
  const [phase, setPhase] = useState<"start" | "moving" | "done">("done")
  const reduced = useReducedMotion()
  const animate = enabled && !reduced && hasMotions

  useLayoutEffect(() => {
    const changed = previousRevision.current !== revision
    previousRevision.current = revision
    if (!animate || !changed) { animatedRevision.current = null; setPhase("done"); return }
    animatedRevision.current = revision
    setPhase("start")
    let secondFrame = 0
    const frame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => setPhase("moving")) })
    const timer = setTimeout(() => setPhase("done"), MOVE_DURATION)
    const finish = () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(secondFrame)
      clearTimeout(timer)
      animatedRevision.current = null
      setPhase("done")
    }
    document.addEventListener("visibilitychange", finish)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(secondFrame)
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", finish)
    }
  }, [revision, animate])

  return { phase, moving: animate && animatedRevision.current === revision && phase !== "done", arriving: animate && animatedRevision.current === revision && phase === "done" }
}
