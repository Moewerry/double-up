import { ArrowRight, Sparkles } from "lucide-react"

export function MergeIllustration() {
  return <div aria-hidden className="relative mx-auto my-12 flex h-44 w-full max-w-[340px] items-center justify-center gap-2 sm:gap-3">
    <div className="absolute inset-x-4 inset-y-0 rounded-[50%] bg-[#ffeadb]/65 blur-xl" />
    <Sparkles className="absolute right-5 top-0 size-5 text-[#b27e53]" />
    <span className="absolute bottom-2 left-9 size-2 rounded-full bg-[#79cda8]" />
    <div className="relative -rotate-12 translate-y-3 rounded-2xl border border-[#f5d6b7] bg-[#ffe9cf] px-5 py-5 text-5xl font-extrabold shadow-[0_10px_0_#f2d6b8,0_20px_30px_#c49b6b20] sm:px-6">8</div>
    <span className="relative text-2xl text-[#a47d65]">+</span>
    <div className="relative rotate-6 -translate-y-3 rounded-2xl border border-[#f5d6b7] bg-[#ffe9cf] px-5 py-5 text-5xl font-extrabold shadow-[0_10px_0_#f2d6b8,0_20px_30px_#c49b6b20] sm:px-6">8</div>
    <ArrowRight className="relative size-5 shrink-0 text-[#a47d65]" />
    <div className="relative rotate-12 translate-y-4 rounded-2xl border border-[#e99772] bg-[#ffac82] px-4 py-6 text-4xl font-extrabold shadow-[0_10px_0_#e59670,0_20px_30px_#c49b6b20]">16</div>
  </div>
}
