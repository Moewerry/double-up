import { useEffect } from "react"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "@/pages/home-page"
import { PlayPage } from "@/pages/play-page"
import { useGameStore } from "@/stores/use-game-store"
import { SAVE_KEY } from "@/lib/storage"
import { SaveNotice } from "@/components/save-notice"

export function App() {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if ((event.key === SAVE_KEY || event.key === null) && event.storageArea === localStorage) useGameStore.getState().externalChange()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])
  return <HashRouter><main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-5 [--page-inset-top:max(1rem,env(safe-area-inset-top))] [--page-inset-bottom:env(safe-area-inset-bottom)] pt-[var(--page-inset-top)] pb-[var(--page-inset-bottom)] has-[[data-actions-below-board]]:min-h-dvh sm:px-8 sm:[--page-inset-top:1.75rem] lg:max-w-[1120px] lg:px-10">
    <SaveNotice />
    <Routes><Route path="/" element={<HomePage />} /><Route path="/play" element={<PlayPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
  </main></HashRouter>
}
