export function isSeed(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 0xffffffff
}

export function randomSeed(): number {
  const value = new Uint32Array(1)
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(value)
  else value[0] = Math.floor(Math.random() * 0x100000000)
  // xorshift32 的全零状态不会再变化。
  return value[0] || 1
}
