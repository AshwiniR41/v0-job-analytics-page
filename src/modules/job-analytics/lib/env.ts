export function readMockApiEnv(): boolean {
  // Allow Vite-style env
  try {
    const viteVal = (import.meta as any)?.env?.MOCK_API
    if (typeof viteVal !== "undefined") {
      return String(viteVal).toLowerCase() === "true"
    }
  } catch {}

  // Allow process.env when available
  try {
    if (typeof process !== "undefined" && process.env && typeof process.env.MOCK_API !== "undefined") {
      return String(process.env.MOCK_API).toLowerCase() === "true"
    }
  } catch {}

  // Allow window override
  try {
    const w = globalThis as any
    if (w && typeof w.MOCK_API !== "undefined") {
      return String(w.MOCK_API).toLowerCase() === "true"
    }
  } catch {}

  // Default safe behavior
  return true
}
