/// <reference types="vite/client" />
import { useEffect } from "react"
import { useGameStore } from "@/stores/use-game-store"

export function useBackgroundMusic() {
  useEffect(() => {
    const music = new Audio()
    music.preload = "none"
    music.src = `${import.meta.env.BASE_URL}audio/background-music.m4a`
    music.loop = true
    music.volume = .28

    function syncPlayback() {
      if (document.hidden || !useGameStore.getState().data.music) {
        music.pause()
      } else if (music.paused) {
        // Browsers may block playback until a trusted user gesture.
        void music.play().catch(() => {})
      }
    }

    // Subscribers run inside the settings switch's gesture handler.
    const unsubscribe = useGameStore.subscribe((state, previous) => {
      if (state.data.music !== previous.data.music) syncPlayback()
    })
    document.addEventListener("pointerup", syncPlayback, true)
    document.addEventListener("keydown", syncPlayback, true)
    document.addEventListener("visibilitychange", syncPlayback)
    syncPlayback()

    return () => {
      unsubscribe()
      document.removeEventListener("pointerup", syncPlayback, true)
      document.removeEventListener("keydown", syncPlayback, true)
      document.removeEventListener("visibilitychange", syncPlayback)
      music.pause()
      music.removeAttribute("src")
      music.load()
    }
  }, [])
}
