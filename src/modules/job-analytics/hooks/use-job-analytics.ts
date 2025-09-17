"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchWithCsrf, getIsMockApi, resolveMockFlag } from "../lib/api"
import { dummyAnalytics, dummyProctoringEvents, dummySectionPerformance } from "../lib/dummy-data"
import type { JobAnalyticsData, ProctoringEvent, SectionPerformance } from "../types"

type State = {
  analytics: JobAnalyticsData | null
  proctoringEvents: ProctoringEvent[]
  sectionPerformance: SectionPerformance[]
  isLoading: boolean
  hasError: boolean
  analyticsError: Error | null
}

const emptyAnalytics = (): JobAnalyticsData => ({
  avg_interview_rating: null,
  total_interviews: 0,
  rated_interviews: 0,
  avg_duration_minutes: null,
  completed_interviews: 0,

  total_applications: 0,
  applied_count: 0,
  resume_received_count: 0,
  interviewing_count: 0,
  application_done_count: 0,
  applied_to_resume_rate: 0,
  resume_to_interview_rate: 0,
  interview_to_done_rate: 0,
  overall_conversion_rate: 0,

  total_proctored_interviews: 0,
  interviews_with_concerns: 0,
  total_critical_events: 0,
  avg_critical_events_per_interview: 0,
  percentage_interviews_with_concerns: 0,

  score_distribution: [],

  interview_date_distribution: [],
  interview_time_distribution: [],

  total_hires: 0,
  avg_days_to_hire: null,
  median_days_to_hire: null,

  completion_rate: 0,
  abandonment_rate: 0,
})

export function useJobAnalytics(jobId?: string) {
  const [state, setState] = useState<State>({
    analytics: null,
    proctoringEvents: [],
    sectionPerformance: [],
    isLoading: !!jobId,
    hasError: false,
    analyticsError: null,
  })

  const load = useCallback(async () => {
    if (!jobId) {
      setState((s) => ({ ...s, analytics: null, isLoading: false }))
      return
    }

    setState((s) => ({ ...s, isLoading: true, hasError: false, analyticsError: null }))

    try {
      // Resolve mock flag reliably (uses /api/mock-flag on client)
      const mock = await resolveMockFlag()
      if (mock || getIsMockApi()) {
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

      // Real mode: call all endpoints in parallel per docs
      const base = `/asyncapi/jobs/${jobId}/reports`

      const [
        interviewMetrics,
        applicationConversion,
        proctoringMetrics,
        scoreDistributionResp,
        timeToHire,
        interviewCompletion,
        interviewTimeline,
        proctoringEventsResp,
        sectionPerformanceResp,
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

      // Unwrap data arrays per docs
      const im = (interviewMetrics?.data?.[0] ?? {}) as Partial<JobAnalyticsData>
      const ac = (applicationConversion?.data?.[0] ?? {}) as Partial<JobAnalyticsData>
      const pm = (proctoringMetrics?.data?.[0] ?? {}) as Partial<JobAnalyticsData>
      const sdArr = (scoreDistributionResp?.data ?? []) as JobAnalyticsData["score_distribution"]
      const tth = (timeToHire?.data?.[0] ?? {}) as Partial<JobAnalyticsData>
      const ic = (interviewCompletion?.data?.[0] ?? {}) as Partial<JobAnalyticsData>

      // Timeline might be JSON-encoded strings; parse when needed
      const tl = interviewTimeline?.data?.[0] ?? {}
      const dateDistRaw = (tl?.interview_date_distribution ?? []) as any
      const timeDistRaw = (tl?.interview_time_distribution ?? []) as any

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

      const combined: JobAnalyticsData = {
        ...emptyAnalytics(),
        // Interview Metrics
        avg_interview_rating: im.avg_interview_rating ?? null,
        total_interviews: im.total_interviews ?? 0,
        rated_interviews: im.rated_interviews ?? 0,
        avg_duration_minutes: im.avg_duration_minutes ?? null,
        completed_interviews: im.completed_interviews ?? 0,

        // Application Conversion
        total_applications: ac.total_applications ?? 0,
        applied_count: ac.applied_count ?? 0,
        resume_received_count: ac.resume_received_count ?? 0,
        interviewing_count: ac.interviewing_count ?? 0,
        application_done_count: ac.application_done_count ?? 0,
        applied_to_resume_rate: ac.applied_to_resume_rate ?? 0,
        resume_to_interview_rate: ac.resume_to_interview_rate ?? 0,
        interview_to_done_rate: ac.interview_to_done_rate ?? 0,
        overall_conversion_rate: ac.overall_conversion_rate ?? 0,

        // Proctoring Metrics
        total_proctored_interviews: pm.total_proctored_interviews ?? 0,
        interviews_with_concerns: pm.interviews_with_concerns ?? 0,
        total_critical_events: pm.total_critical_events ?? 0,
        avg_critical_events_per_interview: pm.avg_critical_events_per_interview ?? 0,
        percentage_interviews_with_concerns: pm.percentage_interviews_with_concerns ?? 0,

        // Score distribution
        score_distribution: sdArr ?? [],

        // Timeline
        interview_date_distribution: dateDist ?? [],
        interview_time_distribution: timeDist ?? [],

        // Time to hire
        total_hires: tth.total_hires ?? 0,
        avg_days_to_hire: tth.avg_days_to_hire ?? null,
        median_days_to_hire: tth.median_days_to_hire ?? null,

        // Completion
        completion_rate: ic.completion_rate ?? 0,
        abandonment_rate: ic.abandonment_rate ?? 0,
      }

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

  useEffect(() => {
    load()
  }, [load])

  const refetchAnalytics = useCallback(() => load(), [load])

  return useMemo(
    () => ({
      analytics: state.analytics,
      analyticsLoading: state.isLoading,
      analyticsError: state.analyticsError,
      proctoringEvents: state.proctoringEvents,
      sectionPerformance: state.sectionPerformance,
      isLoading: state.isLoading,
      hasError: state.hasError,
      refetchAnalytics,
      downloadBasicReport: async () => {
        if (!jobId) return
        if (getIsMockApi()) return
        const blob = await fetchWithCsrf(`/asyncapi/jobs/${jobId}/reports/basic-report?format=excel`, {
          method: "GET",
          asBlob: true,
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `basic_report_${new Date().toISOString().slice(0, 10)}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      },
    }),
    [jobId, state, refetchAnalytics],
  )
}
