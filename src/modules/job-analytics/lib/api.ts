/**
 * API Utilities for Job Analytics Module
 *
 * This module provides utilities for:
 * - Mock/development mode detection and management
 * - CSRF-protected API requests
 * - Environment variable resolution across different contexts
 * - Error handling for API responses
 */

/**
 * Safely converts various value types to boolean
 * Handles string representations like "true", "1", etc.
 * @param {unknown} val - Value to convert to boolean
 * @returns {boolean} Converted boolean value
 */
const readBool = (val: unknown) => {
  if (typeof val === "boolean") return val
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1"
  if (typeof val === "number") return val === 1
  return false
}

// Mock flag caching to prevent repeated environment checks
// null = unknown/unresolved, boolean = resolved value
let mockFlagCached: boolean | null = null
let mockFlagPromise: Promise<boolean> | null = null

/**
 * Attempts to read the mock flag synchronously from various sources
 * Tries multiple environment variable sources in order of preference
 * @returns {boolean | null} Mock flag value or null if not found
 */
function immediateMockFlag(): boolean | null {
  // Try Vite-style environment variables first (modern bundlers)
  try {
    // @ts-ignore - Vite-specific import.meta.env access
    if (typeof import.meta !== "undefined" && (import.meta as any)?.env?.MOCK_API != null) {
      const v = (import.meta as any).env.MOCK_API
      return readBool(v)
    }
  } catch {
    // Ignore errors from import.meta access in non-Vite environments
  }

  // Try Node.js-style process.env (server-side or Node environments)
  if (typeof process !== "undefined" && (process as any).env?.MOCK_API != null) {
    return readBool((process as any).env.MOCK_API)
  }

  // Try window global variable (client-side fallback)
  if (typeof window !== "undefined" && (window as any).MOCK_API != null) {
    return readBool((window as any).MOCK_API)
  }

  return null // No mock flag found in any source
}

/**
 * Returns the currently known mock flag value synchronously
 * Uses cached value if available, otherwise attempts immediate resolution
 * @returns {boolean} Current mock flag state (defaults to false if unknown)
 */
export function getIsMockApi(): boolean {
  // Return cached value if we have one
  if (mockFlagCached !== null) return mockFlagCached

  // Try to resolve immediately from environment
  const v = immediateMockFlag()
  if (v !== null) {
    mockFlagCached = v
    // Cache in window for future calls
    if (typeof window !== "undefined") (window as any).MOCK_API = v
    return v
  }

  // Default to false (production mode) until resolved
  return false
}

/**
 * Reliably resolves the mock flag on the client side
 *
 * Resolution strategy:
 * 1. Check cached value
 * 2. Try synchronous environment sources
 * 3. Fallback to server API call (/api/mock-flag)
 * 4. Cache result for future calls
 *
 * @returns {Promise<boolean>} Promise resolving to mock flag value
 */
export async function resolveMockFlag(): Promise<boolean> {
  // Return cached value if available
  if (mockFlagCached !== null) return mockFlagCached

  // Return existing promise if resolution is in progress
  if (mockFlagPromise) return mockFlagPromise

  // Try synchronous resolution first
  const sync = immediateMockFlag()
  if (sync !== null) {
    mockFlagCached = sync
    if (typeof window !== "undefined") (window as any).MOCK_API = sync
    return sync
  }

  // Server-side fallback (shouldn't happen in normal usage)
  if (typeof window === "undefined") {
    mockFlagCached = false
    return false
  }

  // Client-side: fetch from server API endpoint
  mockFlagPromise = fetch("/api/mock-flag")
    .then(async (r) => {
      try {
        // Validate response is JSON
        const ct = r.headers.get("content-type") || ""
        if (!ct.includes("application/json")) throw new Error("Non-JSON response")

        const j = await r.json()
        return readBool(j?.mock)
      } catch {
        return false // Default to production mode on parse errors
      }
    })
    .catch(() => false) // Default to production mode on network errors
    .then((flag) => {
      // Cache the resolved value
      mockFlagCached = flag
      ;(window as any).MOCK_API = flag
      return flag
    })
    .finally(() => {
      // Clear promise reference for future calls
      mockFlagPromise = null
    })

  return mockFlagPromise
}

/**
 * Extended fetch options with blob support
 * Adds asBlob option for downloading binary files
 */
export type FetchInit = RequestInit & { asBlob?: boolean }

/**
 * Enhanced fetch function with CSRF protection and error handling
 *
 * Features:
 * - Automatic CSRF token injection from meta tags
 * - JSON response validation
 * - Blob download support
 * - Comprehensive error handling with response previews
 * - Mock mode awareness
 *
 * @param {string} input - URL to fetch
 * @param {FetchInit} [init] - Fetch options with optional blob mode
 * @returns {Promise<any>} Response data or blob
 * @throws {Error} Detailed error messages for debugging
 */
export async function fetchWithCsrf(input: string, init?: FetchInit) {
  // In mock mode, still perform fetch but caller should handle mock data
  if (getIsMockApi()) {
    return fetch(input, init)
  }

  // Prepare headers with CSRF protection
  const headers = new Headers(init?.headers ?? {})

  // Add CSRF token if available and not already present
  if (!headers.has("X-CSRFToken")) {
    const meta = typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]') : null
    if (meta) headers.set("X-CSRFToken", meta.getAttribute("content") || "")
  }

  // Ensure JSON Accept header for API requests
  headers.set("Accept", headers.get("Accept") || "application/json")

  // Perform the actual fetch
  const resp = await fetch(input, { ...init, headers })

  // Handle non-successful responses
  if (!resp.ok) {
    const text = await resp.text().catch(() => "")
    throw new Error(text || `Request failed with status ${resp.status}`)
  }

  // Handle blob downloads (for reports, files, etc.)
  if ((init as FetchInit)?.asBlob) {
    return resp.blob()
  }

  // Validate JSON response to prevent parsing errors
  const ct = resp.headers.get("content-type") || ""
  if (!ct.includes("application/json")) {
    const preview = await resp.text().catch(() => "")
    throw new Error("Non-JSON response from server" + (preview ? `: ${preview.slice(0, 120)}...` : ""))
  }

  return resp.json()
}
