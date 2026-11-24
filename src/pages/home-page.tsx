import { ArrowRight, GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"
import { Brand } from "@/components/brand"
import { SettingsDialog } from "@/components/settings-dialog"
import { GamePreview } from "@/components/home/game-preview"
import { Button } from "@/components/ui/button"
import { getLevel, levels } from "@/game/levels"
import { currentRecord } from "@/game/records"
import { useGameStore } from "@/stores/use-game-store"

export function HomePage() {
  const { data, blocked } = useGameStore()
  const { session, records } = data
  const completed = levels.filter(level => currentRecord(records, level)).length
  const finished = completed === levels.length
  const level = getLevel(session.level)
  const label = session.status === "won" ? finished ? "查看通关纪念" : "继续向上闯关" : session.status === "lost" ? `查看第 ${session.level} 关结果` : session.moves > 0 ? `继续第 ${session.level} 关` : completed ? `挑战第 ${session.level} 关` : "开始闯关"
  return <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col">
    <header className="flex shrink-0 items-center justify-between">
      <Brand />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-11 rounded-full" asChild><Link to="/play?mode=tutorial" aria-label="新手教程" title="新手教程"><GraduationCap /></Link></Button>
        <SettingsDialog />
      </div>
    </header>
    <section className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center sm:gap-8 sm:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-[clamp(1.75rem,5vw,2.25rem)] font-bold leading-snug tracking-tight">一点点，翻倍向前。</h1>
        <p className="text-sm text-muted-foreground">第 {level.id} 关 · {level.title}</p>
      </div>
      <GamePreview session={session} />
      <Button size="lg" className="h-12 w-full max-w-[300px] rounded-xl" disabled={blocked} asChild={!blocked}>
        {blocked ? <span>请先恢复存档</span> : <Link to="/play">{label}<ArrowRight data-icon="inline-end" className="ml-auto" /></Link>}
      </Button>
    </section>
  </div>
}
