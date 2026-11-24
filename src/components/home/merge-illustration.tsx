import { ArrowRight } from "lucide-react"

export function MergeIllustration() {
  return <div aria-hidden className="relative order-2 mx-auto flex h-44 w-full max-w-[340px] items-center justify-center gap-2 sm:h-52 sm:gap-3 lg:order-none lg:h-[360px] lg:max-w-[440px] lg:gap-4">
    <div className="hero-wash absolute -inset-x-3 inset-y-1 lg:-inset-x-5 lg:inset-y-5" />
    <span className="hero-bubble right-9 top-0 size-9 lg:right-14 lg:top-5 lg:size-12" />
    <span className="hero-bubble bottom-0 left-8 size-5 lg:bottom-8 lg:left-6 lg:size-7" />
    <span className="hero-bubble right-1 top-16 size-3 lg:top-28 lg:size-4" />
    <div className="hero-tile relative flex size-16 shrink-0 -rotate-12 translate-y-3 items-center justify-center rounded-[1.25rem] bg-[var(--tile-8)] font-numerals text-5xl font-extrabold text-[#396f70] min-[375px]:size-20 lg:size-28 lg:text-6xl">8</div>
    <span className="relative text-2xl text-muted-foreground lg:text-3xl">+</span>
    <div className="hero-tile relative flex size-16 shrink-0 rotate-6 -translate-y-3 items-center justify-center rounded-[1.25rem] bg-[var(--tile-8)] font-numerals text-5xl font-extrabold text-[#396f70] min-[375px]:size-20 lg:size-28 lg:text-6xl">8</div>
    <ArrowRight className="relative size-5 shrink-0 text-muted-foreground lg:size-6" />
    <div className="hero-tile relative flex size-16 shrink-0 rotate-12 translate-y-4 items-center justify-center rounded-[1.25rem] bg-[var(--tile-16)] font-numerals text-4xl font-extrabold text-[#9c4c57] min-[375px]:size-20 lg:size-28 lg:text-5xl">16</div>
  </div>
}
