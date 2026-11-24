import { ArrowRight, GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"
import { Brand } from "@/components/brand"
import { SettingsDialog } from "@/components/settings-dialog"
import { MergeIllustration } from "@/components/home/merge-illustration"
import { Button } from "@/components/ui/button"
import { levels } from "@/game/levels"
import { currentRecord } from "@/game/records"
import { useGameStore } from "@/stores/use-game-store"

export function HomePage() {
  const { data, blocked } = useGameStore()
  const { session, records } = data
  const completed = levels.filter(level => currentRecord(records, level)).length
  const finished = completed === levels.length
  const label = session.status === "won" ? finished ? "查看通关纪念" : "继续向上闯关" : session.status === "lost" ? `查看第 ${session.level} 关结果` : session.moves > 0 ? `继续第 ${session.level} 关` : completed ? `挑战第 ${session.level} 关` : "开始闯关"
  return <div className="flex flex-1 flex-col">
    <header className="flex shrink-0 items-center justify-between">
      <Brand />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-11 rounded-full" asChild><Link to="/play?mode=tutorial" aria-label="新手教程" title="新手教程"><GraduationCap /></Link></Button>
        <SettingsDialog />
      </div>
    </header>
    <section className="grid flex-1 grid-cols-1 grid-rows-[auto_minmax(11rem,1fr)_auto] items-center gap-y-5 pb-[clamp(1.5rem,5svh,3rem)] pt-[clamp(1.5rem,6svh,4rem)] text-center sm:gap-y-8 lg:grid-cols-2 lg:grid-rows-1 lg:gap-16 lg:py-12 lg:text-left">
      <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:items-start">
        <h1 className="order-1 text-[clamp(2.1rem,9vw,3rem)] font-extrabold leading-[1.35] tracking-tight lg:text-[clamp(3.25rem,5vw,4.75rem)] lg:leading-[1.2]">一点点，<br />翻倍<span className="relative text-coral">向前<span className="absolute -bottom-1 left-0 h-1.5 w-full -rotate-2 rounded-full bg-primary/45" /></span>。</h1>
        <Button className="order-3 h-14 w-full rounded-2xl text-base font-bold lg:mt-10 lg:max-w-[280px]" disabled={blocked} asChild={!blocked}>
          {blocked ? <span>请先恢复存档</span> : <Link to="/play">{label}<ArrowRight className="ml-auto size-5" /></Link>}
        </Button>
      </div>
      <MergeIllustration />
    </section>
  </div>
}
