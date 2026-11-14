/// <reference types="vite/client" />
import type { Status } from "@/game/types"

type Effect = Status | "slide" | "merge"
const players: Partial<Record<Effect, HTMLAudioElement>> = {}

export function playSound(status: Status, gained: number) {
  if (document.hidden) return

  const effect = status === "playing" ? (gained > 0 ? "merge" : "slide") : status
  const player = players[effect] ??= new Audio(`${import.meta.env.BASE_URL}audio/${effect}.flac`)
  if (!player.paused) return
  if (player.ended) player.currentTime = 0
  void player.play().catch(() => {})
}
