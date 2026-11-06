import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Brand } from "@/components/brand"
import { SettingsDialog } from "@/components/settings-dialog"
import { MergeIllustration } from "@/components/home/merge-illustration"
import { Button } from "@/components/ui/button"
import { levels } from "@/game/levels"
import { useGameStore } from "@/stores/use-game-store"

export function HomePage() {
  const { data, blocked } = useGameStore()
  const { session, records } = data
  const completed = Object.keys(records).length
  const finished = completed === levels.length
  const label = session.status === "won" ? finished ? "查看通关纪念" : "继续向上闯关" : session.status === "lost" ? `查看第 ${session.level} 关结果` : session.moves > 0 ? `继续第 ${session.level} 关` : completed ? `挑战第 ${session.level} 关` : "开始闯关"
  return <>
    <header className="flex items-center justify-between"><Brand /><SettingsDialog /></header>
    <section className="flex flex-col items-center pb-8 pt-9 text-center sm:pt-14 lg:grid lg:min-h-[calc(100svh-8rem)] lg:grid-cols-2 lg:gap-16 lg:py-12 lg:text-left">
      <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:items-start">
        <h1 className="order-1 text-[clamp(2.1rem,9vw,3rem)] font-extrabold leading-[1.35] tracking-tight lg:text-[clamp(3.25rem,5vw,4.75rem)] lg:leading-[1.2]">一点点，<br />翻倍<span className="relative text-[#ad5234]">向前<span className="absolute -bottom-1 left-0 h-1 w-full -rotate-2 rounded-full bg-[#ffccad]" /></span>。</h1>
        <Button className="order-3 h-14 w-full rounded-xl text-base font-bold shadow-[0_5px_0_#e58b65] transition-transform active:translate-y-1 active:shadow-none lg:mt-10 lg:max-w-[280px]" disabled={blocked} asChild={!blocked}>
          {blocked ? <span>请先恢复存档</span> : <Link to="/play">{label}<ArrowRight className="ml-auto size-5" /></Link>}
        </Button>
      </div>
      <MergeIllustration />
    </section>
  </>
}
