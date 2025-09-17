"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchWithCsrf, getIsMockApi, resolveMockFlag } from "../lib/api"
import { dummyAnalytics, dummyProctoringEvents, dummySectionPerformance } from "../lib/dummy-data"
import type { JobAnalyticsData, ProctoringEvent, SectionPerformance } from "../types"

/**
 * Internal state type for the useJobAnalytics hook
 * Manages all analytics data, loading states, and error handling
 */
type State = {
  analytics: JobAnalyticsData | null // Main analytics data from API
  proctoringEvents: ProctoringEvent[] // Security/monitoring events during interviews
  sectionPerformance: SectionPerformance[] // Performance breakdown by interview section
  isLoading: boolean // Global loading state for all data fetching
  hasError: boolean // Global error state
  analyticsError: Error | null // Specific error details for debugging
}

/**
 * Creates an empty analytics data object with all fields initialized to safe defaults
 * Used as fallback when no data is available or during error states
 * @returns {JobAnalyticsData} Empty analytics object with zero/null values
 */
const emptyAnalytics = (): JobAnalyticsData => ({
  // Interview metrics - null indicates no data available
  avg_interview_rating: null,
  total_interviews: 0,
  rated_interviews: 0,
  avg_duration_minutes: null,
  completed_interviews: 0,

  // Application funnel metrics - track conversion through hiring process
  total_applications: 0,
  applied_count: 0,
  resume_received_count: 0,
  interviewing_count: 0,
  application_done_count: 0,
  applied_to_resume_rate: 0,
  resume_to_interview_rate: 0,
  interview_to_done_rate: 0,
  overall_conversion_rate: 0,

  // Proctoring/security metrics - monitor interview integrity
  total_proctored_interviews: 0,
  interviews_with_concerns: 0,
  total_critical_events: 0,
  avg_critical_events_per_interview: 0,
  percentage_interviews_with_concerns: 0,

  // Score distribution - empty array indicates no scoring data
  score_distribution: [],

  // Timeline data - tracks when interviews occur
  interview_date_distribution: [],
  interview_time_distribution: [],

  // Hiring metrics - track time to completion
  total_hires: 0,
  avg_days_to_hire: null,
  median_days_to_hire: null,

  // Completion metrics - track interview abandonment
  completion_rate: 0,
  abandonment_rate: 0,
})

/**
 * Custom hook for managing job analytics data
 *
 * Handles:
 * - Fetching analytics data from multiple API endpoints
 * - Mock/development mode with dummy data
 * - Error handling and loading states
 * - Data transformation and combination
 * - Report downloading functionality
 *
 * @param {string} [jobId] - Optional job ID to fetch analytics for
 * @returns {Object} Analytics data, loading states, and utility functions
 */
export function useJobAnalytics(jobId?: string) {
  // Initialize state with loading true only if we have a jobId to fetch
  const [state, setState] = useState<State>({
    analytics: null,
    proctoringEvents: [],
    sectionPerformance: [],
    isLoading: !!jobId, // Only start loading if we have a job ID
    hasError: false,
    analyticsError: null,
  })

  /**
   * Main data loading function
   * Handles both mock and real API modes, fetches from multiple endpoints in parallel
   */
  const load = useCallback(async () => {
    // Early return if no job ID provided
    if (!jobId) {
      setState((s) => ({ ...s, analytics: null, isLoading: false }))
      return
    }

    // Reset state for new loading cycle
    setState((s) => ({ ...s, isLoading: true, hasError: false, analyticsError: null }))

    try {
      // Check if we're in mock mode (development/testing)
      const mock = await resolveMockFlag()
      if (mock || getIsMockApi()) {
        // Use dummy data for development/testing
        setState((s) => ({
          ...s,
          analytics: dummyAnalytics,
          proctoringEvents: dummyProctoringEvents,
          sectionPerformance: dummySectionPerformance,
          isLoading: false,
          hasError: false,
          analyticsError: null,
        }))
        return
      }

      // Production mode: fetch from real API endpoints
      // All endpoints are called in parallel for better performance
      const base = `/asyncapi/jobs/${jobId}/reports`

      const [
        interviewMetrics, // Basic interview statistics
        applicationConversion, // Funnel conversion rates
        proctoringMetrics, // Security/monitoring data
        scoreDistributionResp, // Score histogram data
        timeToHire, // Hiring timeline metrics
        interviewCompletion, // Completion/abandonment rates
        interviewTimeline, // When interviews occur
        proctoringEventsResp, // Detailed security events
        sectionPerformanceResp, // Performance by interview section
      ] = await Promise.all([
        fetchWithCsrf(`${base}/interview-metrics?format=json`, { method: "GET" }),
        fetchWithCsrf(`${base}/application-conversion?format=json`, { method: "GET" }),
        fetchWithCsrf(`${base}/proctoring-metrics?format=json`, { method: "GET" }),
        fetchWithCsrf(`${base}/score-distribution?format=json`, { method: "GET" }),
        fetchWithCsrf(`${base}/time-to-hire?format=json`, { method: "GET" }),
        fetchWithCsrf(`${base}/interview-completion?format=json`, { method: "GET" }),
        fetchWithCsrf(`${base}/interview-timeline?format=json`, { method: "GET" }),
        fetchWithCsrf(`${base}/proctoring-events?format=json`, { method: "GET" }),
        fetchWithCsrf(`${base}/section-performance?format=json`, { method: "GET" }),
      ])

      // Extract data from API response format (data arrays)
      const im = (interviewMetrics?.data?.[0] ?? {}) as Partial<JobAnalyticsData>
      const ac = (applicationConversion?.data?.[0] ?? {}) as Partial<JobAnalyticsData>
      const pm = (proctoringMetrics?.data?.[0] ?? {}) as Partial<JobAnalyticsData>
      const sdArr = (scoreDistributionResp?.data ?? []) as JobAnalyticsData["score_distribution"]
      const tth = (timeToHire?.data?.[0] ?? {}) as Partial<JobAnalyticsData>
      const ic = (interviewCompletion?.data?.[0] ?? {}) as Partial<JobAnalyticsData>

      // Handle timeline data which might be JSON-encoded strings
      const tl = interviewTimeline?.data?.[0] ?? {}
      const dateDistRaw = (tl?.interview_date_distribution ?? []) as any
      const timeDistRaw = (tl?.interview_time_distribution ?? []) as any

      /**
       * Utility function to parse potentially JSON-encoded data
       * Some API endpoints return JSON strings instead of objects
       */
      const parseMaybeJson = <T,>(val: unknown, fallback: T): T => {
        if (typeof val === "string") {
          try {
            const parsed = JSON.parse(val)
            return parsed as T
          } catch {
            return fallback
          }
        }
        if (Array.isArray(val)) return val as T
        return fallback
      }

      const dateDist = parseMaybeJson<JobAnalyticsData["interview_date_distribution"]>(dateDistRaw, [])
      const timeDist = parseMaybeJson<JobAnalyticsData["interview_time_distribution"]>(timeDistRaw, [])

      const proctoringEvents = (proctoringEventsResp?.data ?? []) as ProctoringEvent[]
      const sectionPerformance = (sectionPerformanceResp?.data ?? []) as SectionPerformance[]

      // Combine all data sources into single analytics object
      // Use nullish coalescing to provide safe defaults for missing data
      const combined: JobAnalyticsData = {
        ...emptyAnalytics(),

        // Interview Metrics
        avg_interview_rating: im.avg_interview_rating ?? null,
        total_interviews: im.total_interviews ?? 0,
        rated_interviews: im.rated_interviews ?? 0,
        avg_duration_minutes: im.avg_duration_minutes ?? null,
        completed_interviews: im.completed_interviews ?? 0,

        // Application Conversion Funnel
        total_applications: ac.total_applications ?? 0,
        applied_count: ac.applied_count ?? 0,
        resume_received_count: ac.resume_received_count ?? 0,
        interviewing_count: ac.interviewing_count ?? 0,
        application_done_count: ac.application_done_count ?? 0,
        applied_to_resume_rate: ac.applied_to_resume_rate ?? 0,
        resume_to_interview_rate: ac.resume_to_interview_rate ?? 0,
        interview_to_done_rate: ac.interview_to_done_rate ?? 0,
        overall_conversion_rate: ac.overall_conversion_rate ?? 0,

        // Proctoring/Security Metrics
        total_proctored_interviews: pm.total_proctored_interviews ?? 0,
        interviews_with_concerns: pm.interviews_with_concerns ?? 0,
        total_critical_events: pm.total_critical_events ?? 0,
        avg_critical_events_per_interview: pm.avg_critical_events_per_interview ?? 0,
        percentage_interviews_with_concerns: pm.percentage_interviews_with_concerns ?? 0,

        // Score distribution histogram
        score_distribution: sdArr ?? [],

        // Interview timing patterns
        interview_date_distribution: dateDist ?? [],
        interview_time_distribution: timeDist ?? [],

        // Hiring completion metrics
        total_hires: tth.total_hires ?? 0,
        avg_days_to_hire: tth.avg_days_to_hire ?? null,
        median_days_to_hire: tth.median_days_to_hire ?? null,

        // Interview completion tracking
        completion_rate: ic.completion_rate ?? 0,
        abandonment_rate: ic.abandonment_rate ?? 0,
      }

      // Update state with successful data
      setState((s) => ({
        ...s,
        analytics: combined,
        proctoringEvents,
        sectionPerformance,
        isLoading: false,
        hasError: false,
        analyticsError: null,
      }))
    } catch (e: any) {
      // Handle any errors during data fetching
      setState((s) => ({
        ...s,
        analytics: null,
        proctoringEvents: [],
        sectionPerformance: [],
        isLoading: false,
        hasError: true,
        analyticsError: e,
      }))
    }
  }, [jobId])

  // Trigger data loading when jobId changes
  useEffect(() => {
    load()
  }, [load])

  // Memoized function to manually refresh data
  const refetchAnalytics = useCallback(() => load(), [load])

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Core data
      analytics: state.analytics,
      analyticsLoading: state.isLoading,
      analyticsError: state.analyticsError,
      proctoringEvents: state.proctoringEvents,
      sectionPerformance: state.sectionPerformance,

      // State flags
      isLoading: state.isLoading,
      hasError: state.hasError,

      // Utility functions
      refetchAnalytics,

      /**
       * Downloads a basic Excel report of the analytics data
       * Only works in production mode (not mock)
       */
      downloadBasicReport: async () => {
        if (!jobId) return
        if (getIsMockApi()) return // Skip download in mock mode

        try {
          // Fetch Excel blob from API
          const blob = await fetchWithCsrf(`/asyncapi/jobs/${jobId}/reports/basic-report?format=excel`, {
            method: "GET",
            asBlob: true,
          })

          // Create download link and trigger download
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `basic_report_${new Date().toISOString().slice(0, 10)}.xlsx`
          a.click()
          URL.revokeObjectURL(url) // Clean up memory
        } catch (error) {
          console.error("Failed to download report:", error)
        }
      },
    }),
    [jobId, state, refetchAnalytics],
  )
}
