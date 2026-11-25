import { AccentMarks } from "./accent-marks"

export function HomeHeadline() {
  return <h1 className="home-headline">
    <span className="home-headline-text home-motion:animate-home-enter">合成你的第一个</span>
    <span className="home-headline-number home-motion:animate-home-enter [--home-enter-delay:55ms]">
      2048<AccentMarks className="home-accent--title" />
    </span>
  </h1>
}
