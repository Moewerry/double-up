import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Brand } from "@/components/brand"
import { SettingsDialog } from "@/components/settings-dialog"
import { GamePreview } from "@/components/home/game-preview"
import { HomeHeadline } from "@/components/home/home-headline"
import { HomeBackdrop } from "@/components/home/home-backdrop"
import { Button } from "@/components/ui/button"
import { levels } from "@/game/levels"
import { currentRecord } from "@/game/records"
import { useGameStore } from "@/stores/use-game-store"

export function HomePage() {
  const { data, blocked } = useGameStore()
  const { session, records } = data
  const completed = levels.filter(level => currentRecord(records, level)).length
  const finished = completed === levels.length
  const label = session.status === "won" ? finished ? "查看通关纪念" : "继续游戏" : session.status === "lost" ? "查看结果" : session.moves > 0 || completed ? "继续游戏" : "开始游戏"
  return <>
    <HomeBackdrop />
    <div className="home-page">
      <header className="home-header">
        <Brand className="home-brand" />
        <div className="home-header-actions">
          <Button variant="home-icon" size="icon" asChild>
            <Link to="/play?mode=tutorial" aria-label="新手教程" title="新手教程"><span className="home-help-mark" aria-hidden>?</span></Link>
          </Button>
          <SettingsDialog appearance="home" />
        </div>
      </header>
      <section className="home-hero">
        <div className="home-copy">
          <HomeHeadline />
          <Button variant="home-start" disabled={blocked} asChild={!blocked}>
            {blocked ? <span>请先恢复存档</span> : <Link to="/play">{label}<ArrowRight data-icon="inline-end" /></Link>}
          </Button>
        </div>
        <GamePreview />
      </section>
    </div>
  </>
}
