import { AccentMarks } from "./accent-marks"

export function HomeHeadline() {
  return <h1 className="home-headline">
    <span className="home-headline-text">合成你的第一个</span>
    <span className="home-headline-number">2048<AccentMarks className="home-accent--title" /></span>
  </h1>
}
