import { AccentMarks } from "./accent-marks"

export function HomeHeadline() {
  return <h1 className="home-headline">
    <span className="home-headline-text home-motion:animate-home-enter [--home-enter-at:30ms]">合成你的第一个</span>
    <span className="home-headline-number home-motion:animate-home-impact-enter home-motion:after:animate-home-underline">
      <span className="inline-block home-motion:animate-home-number">2048</span>
      <AccentMarks className="home-accent--title" />
    </span>
  </h1>
}
