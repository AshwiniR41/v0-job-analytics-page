"use client"

import { useEffect, useState } from "react"
import { getIsMockApi, resolveMockFlag, fetchWithCsrf } from "../lib/api"
import type { Job } from "../types"

export function useJob(jobId?: string, override?: Job | null) {
  const [job, setJob] = useState<Job | null>(override ?? null)
  const [loading, setLoading] = useState<boolean>(!override && !!jobId)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (override) {
      setJob(override)
      setLoading(false)
      return
    }
    if (!jobId) return

    let cancelled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)

        const mock = await resolveMockFlag()
        if (mock || getIsMockApi()) {
          const now = new Date().toISOString()
          const mockJob: Job = {
            id: jobId,
            title: `Job #${jobId}`,
            description: "",
            key_skills: [],
            type_of_job: "FULL_TIME",
            visibility: "PUBLIC",
            created_at: now,
            updated_at: now,
            is_active: true,
            applications_last_n_hours: 0,
            total_applications: 0,
          }
          if (!cancelled) setJob(mockJob)
        } else {
          const data = await fetchWithCsrf(`/api/jobs/${jobId}/`, { method: "GET" })
          const jobData = (data?.data ?? data) as Job
          if (!cancelled) setJob(jobData)
        }
      } catch (e: any) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [jobId, override])

  return { job, loading, error }
}
