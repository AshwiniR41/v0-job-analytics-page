"use client"

import { useMemo } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { JobAnalyticsPage } from "./job-analytics-page"

export type JobAnalyticsModuleProps = {
  jobId: string
  jobTitle?: string | null
}

let singletonClient: QueryClient | null = null
function getQueryClient() {
  if (!singletonClient) {
    singletonClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })
  }
  return singletonClient
}

export function JobAnalyticsModule(props: JobAnalyticsModuleProps) {
  const { jobId, jobTitle } = props
  const client = getQueryClient()

  // Build a minimal override for the header if jobTitle is provided.
  const jobOverride = useMemo(() => (jobTitle ? ({ title: jobTitle } as any) : null), [jobTitle])

  return (
    <QueryClientProvider client={client}>
      <JobAnalyticsPage jobId={jobId} jobOverride={jobOverride} />
    </QueryClientProvider>
  )
}
