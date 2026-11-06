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
  return <HashRouter><main className="mx-auto min-h-dvh w-full max-w-[480px] px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] sm:px-8 sm:pt-7 lg:max-w-[1120px] lg:px-10">
    <SaveNotice />
    <Routes><Route path="/" element={<HomePage />} /><Route path="/play" element={<PlayPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
  </main></HashRouter>
}
