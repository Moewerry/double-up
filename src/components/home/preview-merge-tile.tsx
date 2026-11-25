export function PreviewMergeTile() {
  return <div className="home-preview-merge relative z-10 size-full rounded-[inherit] home-motion:after:animate-home-merge-ring">
    <span className="home-preview-tile home-motion:animate-home-merge-result" data-value={16}>16</span>
    <span className="home-preview-tile home-preview-merge-piece home-motion:animate-home-merge-anchor" data-value={8}>8</span>
    <span className="home-preview-tile home-preview-merge-piece home-motion:animate-home-merge-incoming" data-value={8}>8</span>
  </div>
}
