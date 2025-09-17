const readBool = (val: unknown) => {
  if (typeof val === "boolean") return val
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1"
  if (typeof val === "number") return val === 1
  return false
}

// Cached mock flag (null = unknown, will try to resolve on client)
let mockFlagCached: boolean | null = null
let mockFlagPromise: Promise<boolean> | null = null

function immediateMockFlag(): boolean | null {
  // Try to read synchronously from common sources
  try {
    // @ts-ignore Vite style
    if (typeof import.meta !== "undefined" && (import.meta as any)?.env?.MOCK_API != null) {
      const v = (import.meta as any).env.MOCK_API
      return readBool(v)
    }
  } catch {}
  if (typeof process !== "undefined" && (process as any).env?.MOCK_API != null) {
    return readBool((process as any).env.MOCK_API)
  }
  if (typeof window !== "undefined" && (window as any).MOCK_API != null) {
    return readBool((window as any).MOCK_API)
  }
  return null
}

/**
 * Return the currently known mock flag synchronously (may be stale if not resolved yet).
 */
export function getIsMockApi(): boolean {
  if (mockFlagCached !== null) return mockFlagCached
  const v = immediateMockFlag()
  if (v !== null) {
    mockFlagCached = v
    // also mirror to window for future calls
    if (typeof window !== "undefined") (window as any).MOCK_API = v
    return v
  }
  // default to false until resolved
  return false
}

/**
 * Resolve the mock flag reliably on the client by asking the server once and caching it.
 */
export async function resolveMockFlag(): Promise<boolean> {
  if (mockFlagCached !== null) return mockFlagCached
  if (mockFlagPromise) return mockFlagPromise
  // First try synchronous sources again
  const sync = immediateMockFlag()
  if (sync !== null) {
    mockFlagCached = sync
    if (typeof window !== "undefined") (window as any).MOCK_API = sync
    return sync
  }
  // Fallback: fetch server route
  if (typeof window === "undefined") {
    mockFlagCached = false
    return false
  }
  mockFlagPromise = fetch("/api/mock-flag")
    .then(async (r) => {
      try {
        const ct = r.headers.get("content-type") || ""
        if (!ct.includes("application/json")) throw new Error("Non-JSON response")
        const j = await r.json()
        return readBool(j?.mock)
      } catch {
        return false
      }
    })
    .catch(() => false)
    .then((flag) => {
      mockFlagCached = flag
      ;(window as any).MOCK_API = flag
      return flag
    })
    .finally(() => {
      mockFlagPromise = null
    })
  return mockFlagPromise
}

export type FetchInit = RequestInit & { asBlob?: boolean }

export async function fetchWithCsrf(input: string, init?: FetchInit) {
  // If mock mode is on, callers should not be using this for real data. Still return fetch to preserve shape if needed.
  if (getIsMockApi()) {
    return fetch(input, init)
  }

  const headers = new Headers(init?.headers ?? {})
  // Basic CSRF header support if a meta tag is present (host app responsibility)
  if (!headers.has("X-CSRFToken")) {
    const meta = typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]') : null
    if (meta) headers.set("X-CSRFToken", meta.getAttribute("content") || "")
  }
  headers.set("Accept", headers.get("Accept") || "application/json")

  const resp = await fetch(input, { ...init, headers })
  // Not ok → raise text payload
  if (!resp.ok) {
    const text = await resp.text().catch(() => "")
    throw new Error(text || `Request failed with status ${resp.status}`)
  }
  // Blob mode
  if ((init as FetchInit)?.asBlob) {
    return resp.blob()
  }
  // Ensure JSON content type to avoid "Unexpected token <"
  const ct = resp.headers.get("content-type") || ""
  if (!ct.includes("application/json")) {
    const preview = await resp.text().catch(() => "")
    throw new Error("Non-JSON response from server" + (preview ? `: ${preview.slice(0, 120)}...` : ""))
  }
  return resp.json()
}
