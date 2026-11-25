import { AccentMarks } from "./accent-marks"

const previewTiles: Record<number, number> = { 1: 2, 7: 4, 8: 8, 10: 16 }

export function GamePreview() {
  return <div
    aria-hidden
    className="home-board-art home-motion:animate-home-enter [--home-enter-delay:110ms] [--home-enter-offset:14px] [--home-enter-scale:0.97]"
  >
    <span className="home-board-shape home-board-shape--sage" />
    <span className="home-board-shape home-board-shape--peach" />
    <span className="home-board-shape home-board-shape--cream" />
    <div className="home-preview-board">
      {Array.from({ length: 16 }, (_, position) => (
        <div
          key={position}
          className="home-preview-cell home-motion:data-[value=16]:animate-home-tile-merge"
          data-value={previewTiles[position]}
        >
          {previewTiles[position]}
        </div>
      ))}
    </div>
    <AccentMarks className="home-accent--board-top" />
    <AccentMarks className="home-accent--board-left" />
    <AccentMarks className="home-accent--board-merge home-motion:animate-home-merge-accent" />
  </div>
}
