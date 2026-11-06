import { useEffect } from "react"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { HomePage } from "@/pages/home-page"
import { GamePage } from "@/pages/game-page"
import { useGameStore } from "@/stores/use-game-store"
import { SAVE_KEY } from "@/lib/storage"

export function App() {
  const notice = useGameStore(state => state.notice)
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if ((event.key === SAVE_KEY || event.key === null) && event.storageArea === localStorage) useGameStore.getState().externalChange()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])
  return <HashRouter><main className="mx-auto min-h-dvh w-full max-w-[480px] px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] sm:px-8 sm:pt-7">
    {notice && <p role="alert" className="mb-4 rounded-xl border border-[#d3aa78] bg-[#fff0d7] p-3 text-xs leading-6 text-[#704921]">{notice}</p>}
    <Routes><Route path="/" element={<HomePage />} /><Route path="/play" element={<GamePage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
  </main></HashRouter>
}
