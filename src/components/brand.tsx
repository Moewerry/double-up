import { Link } from "react-router-dom"

export function Brand() {
  return <Link to="/" aria-label="DoubleUp 首页" className="inline-flex min-h-11 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-ring">
    <span aria-hidden className="relative mr-1 size-7"><span className="absolute left-0 top-0 size-5 rounded-[5px] border border-border bg-secondary" /><span className="absolute bottom-0 right-0 size-5 rounded-[5px] border-2 border-background bg-primary" /></span>
    <span className="text-xl font-extrabold tracking-[-.06em]">double<span className="text-primary">up.</span></span>
  </Link>
}
