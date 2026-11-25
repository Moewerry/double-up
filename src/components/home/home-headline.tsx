import { AccentMarks } from "./accent-marks"

export function HomeHeadline() {
  return <h1 className="home-headline">
    <span className="home-headline-text home-motion:animate-home-enter [--home-enter-at:30ms]">合成你的第一个</span>
    <span className="home-headline-number home-motion:after:animate-home-underline">
      <span className="home-headline-number-mask block home-motion:overflow-clip home-motion:[overflow-clip-margin:0.12em]">
        <span className="block home-motion:animate-home-number">2048</span>
      </span>
      <AccentMarks className="home-accent--title" />
    </span>
  </h1>
}
