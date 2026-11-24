import { useEffect, useState } from "react"
import type { LevelConfig } from "@/game/level-types"
import { TutorialGesture } from "@/components/tutorial/tutorial-gesture"

export function OpeningHint({ level, moves, enabled }: { level: LevelConfig; moves: number; enabled: boolean }) {
  const [visible, setVisible] = useState(level.id === 1)
  useEffect(() => {
    setVisible(level.id === 1)
    if (!enabled || moves > 0 || !level.hintDirection) return
    const timer = setTimeout(() => setVisible(true), level.id === 1 ? 0 : 2500)
    return () => clearTimeout(timer)
  }, [level.id, level.hintDirection, moves, enabled])
  return visible && enabled && moves === 0 && level.hintDirection ? <TutorialGesture direction={level.hintDirection} hint={0} /> : null
}
