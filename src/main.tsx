import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode><main className="mx-auto max-w-[480px] px-6 py-16"><h1 className="text-4xl font-black">DoubleUp<span className="text-primary">.</span></h1><p className="mt-4 text-muted-foreground">一点点，翻倍向前。</p></main></StrictMode>,
)
