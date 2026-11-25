export function HomeBackdrop() {
  return <div aria-hidden className="home-waves">
    <span className="home-motion:animate-home-wave" />
    <span className="home-motion:animate-home-wave [--home-wave-delay:1.3s] [--home-wave-drift:clamp(-24px,-2vw,-6px)]" />
    <span />
  </div>
}
