export function HomeBackdrop() {
  return <div aria-hidden className="home-waves">
    <span className="home-motion:animate-home-wave" />
    <span className="home-motion:animate-home-wave [--home-wave-delay:1.3s] [--home-wave-drift:clamp(-14px,-1.2vw,-4px)]" />
    <span />
  </div>
}
