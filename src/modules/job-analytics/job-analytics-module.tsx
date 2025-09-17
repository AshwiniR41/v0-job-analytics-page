"use client"

import { useMemo } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { JobAnalyticsPage } from "./job-analytics-page"

/**
 * Props for the JobAnalyticsModule component
 * @interface JobAnalyticsModuleProps
 * @property {string} jobId - The unique identifier for the job to display analytics for
 * @property {string | null} [jobTitle] - Optional job title override for display purposes
 */
export type JobAnalyticsModuleProps = {
  jobId: string
  jobTitle?: string | null
}

// Singleton QueryClient instance to prevent unnecessary re-instantiation
// This ensures consistent caching and state management across the module
let singletonClient: QueryClient | null = null

/**
 * Creates or returns the singleton QueryClient instance
 * Configured with optimized defaults for analytics data:
 * - 5 minute stale time to reduce unnecessary refetches
 * - Single retry attempt for failed requests
 * - Disabled refetch on window focus to prevent excessive API calls
 * @returns {QueryClient} The configured QueryClient instance
 */
function getQueryClient() {
  if (!singletonClient) {
    singletonClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes - analytics data doesn't change frequently
          retry: 1, // Single retry for failed requests
          refetchOnWindowFocus: false, // Prevent excessive refetching
        },
      },
    })
  }
  return singletonClient
}

/**
 * Main entry point for the Job Analytics Module
 *
 * This component serves as the root provider for the entire analytics dashboard,
 * setting up React Query for data management and passing configuration to the main page.
 *
 * Features:
 * - Singleton QueryClient for efficient data caching
 * - Optional job title override for custom display
 * - Automatic fallback to job ID if title not provided
 *
 * @param {JobAnalyticsModuleProps} props - Component props
 * @returns {JSX.Element} The analytics module wrapped in QueryClient provider
 */
export function JobAnalyticsModule(props: JobAnalyticsModuleProps) {
  const { jobId, jobTitle } = props
  const client = getQueryClient()

  // Create job override object only when jobTitle is provided
  // This memoization prevents unnecessary re-renders when props haven't changed
  const jobOverride = useMemo(() => (jobTitle ? ({ title: jobTitle } as any) : null), [jobTitle])

  return (
    <QueryClientProvider client={client}>
      <JobAnalyticsPage jobId={jobId} jobOverride={jobOverride} />
    </QueryClientProvider>
  )
}
