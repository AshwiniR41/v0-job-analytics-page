/**
 * Type Definitions for Job Analytics Module
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the job analytics system. These types ensure type safety and provide
 * clear contracts between components, API responses, and data structures.
 */

/**
 * Core Job entity representing a job posting
 * Contains all metadata and configuration for a job listing
 */
export type Job = {
  id: string // Unique job identifier
  title: string // Job title/position name
  description: string // Full job description
  short_description?: string | null // Brief summary for listings
  uploaded_job_description?: string | null // Original uploaded description
  key_skills: string[] // Required skills/technologies
  experience?: string | null // Experience level requirement
  location?: string | null // Job location (remote, city, etc.)
  type_of_job: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" // Employment type
  industry?: string | null // Industry/sector
  custom_tags?: Array<{
    // Custom categorization tags
    label: string
    color?: string // Display color for tag
    icon?: string // Icon identifier
  }>
  visibility: "PUBLIC" | "PRIVATE" // Job listing visibility
  created_at: string // ISO timestamp of creation
  updated_at: string // ISO timestamp of last update
  is_active: boolean // Whether job is currently active
  applications_last_n_hours: number // Recent application count
  total_applications: number // Total application count
  interview_link?: string | null // Link to interview platform
}

/**
 * Comprehensive analytics data structure
 * Aggregates metrics from multiple sources to provide complete job performance insights
 */
export type JobAnalyticsData = {
  // Interview Performance Metrics
  avg_interview_rating: number | null // Average rating across all interviews (null if no ratings)
  total_interviews: number // Total number of interviews conducted
  rated_interviews: number // Number of interviews that received ratings
  avg_duration_minutes: number | null // Average interview duration (null if no data)
  completed_interviews: number // Number of fully completed interviews

  // Application Conversion Funnel Metrics
  // These track candidates through the hiring pipeline
  total_applications: number // Total applications received
  applied_count: number // Candidates who submitted applications
  resume_received_count: number // Applications with resumes attached
  interviewing_count: number // Candidates currently in interview process
  application_done_count: number // Candidates who completed full process
  applied_to_resume_rate: number // Conversion rate: applied → resume submitted
  resume_to_interview_rate: number // Conversion rate: resume → interview
  interview_to_done_rate: number // Conversion rate: interview → completion
  overall_conversion_rate: number // End-to-end conversion rate

  // Proctoring and Security Metrics
  // Monitor interview integrity and security concerns
  total_proctored_interviews: number // Interviews with monitoring enabled
  interviews_with_concerns: number // Interviews flagged for security issues
  total_critical_events: number // Total security events detected
  avg_critical_events_per_interview: number // Average security events per interview
  percentage_interviews_with_concerns: number // Percentage of interviews with issues

  // Score Distribution Data
  // Histogram of candidate performance scores
  score_distribution: Array<{
    rating_bucket: string // Score range label (e.g., "4.0-4.5")
    candidate_count: number // Number of candidates in this range
    percentage: number // Percentage of total candidates
    avg_rating_in_bucket: number // Average score within this bucket
  }>

  // Interview Timeline Patterns
  // When interviews are scheduled and conducted
  interview_date_distribution: Array<{
    date: string // Date in ISO format
    candidate_count: number // Number of interviews on this date
  }>
  interview_time_distribution: Array<{
    hour: number // Hour of day (0-23)
    candidate_count: number // Number of interviews at this hour
  }>

  // Hiring Completion Metrics
  total_hires: number // Number of successful hires
  avg_days_to_hire: number | null // Average time from application to hire
  median_days_to_hire: number | null // Median time to hire (more robust than average)

  // Interview Completion Tracking
  completion_rate: number // Percentage of interviews completed
  abandonment_rate: number // Percentage of interviews abandoned
}

/**
 * Proctoring event data structure
 * Represents security or monitoring events during interviews
 */
export type ProctoringEvent = {
  event_type: string // Type of event (e.g., "tab_switch", "face_not_detected")
  event_count: number // How many times this event occurred
  interviews_affected: number // Number of interviews where this event happened
  avg_time_in_interview_minutes: number | null // Average time when event occurs in interview
}

/**
 * Section performance data structure
 * Breaks down candidate performance by interview section/component
 */
export type SectionPerformance = {
  section_type: string // Type of section (e.g., "coding", "behavioral")
  section_key: string // Unique identifier for the section
  total_sections: number // Total number of this section type administered
  evaluated_sections: number // Number of sections that received evaluations
  avg_section_rating: number | null // Average rating for this section type
  avg_duration_minutes: number | null // Average time spent on this section
}

// API Response Types
// These types represent the structure of data returned from API endpoints

export type InterviewMetricsResponse = {
  data: Array<
    Partial<
      Pick<
        JobAnalyticsData,
        | "avg_interview_rating"
        | "total_interviews"
        | "rated_interviews"
        | "avg_duration_minutes"
        | "completed_interviews"
      >
    >
  >
}

export type ApplicationConversionResponse = {
  data: Array<
    Partial<
      Pick<
        JobAnalyticsData,
        | "total_applications"
        | "applied_count"
        | "resume_received_count"
        | "interviewing_count"
        | "application_done_count"
        | "applied_to_resume_rate"
        | "resume_to_interview_rate"
        | "interview_to_done_rate"
        | "overall_conversion_rate"
      >
    >
  >
}

export type ProctoringMetricsResponse = {
  data: Array<
    Partial<
      Pick<
        JobAnalyticsData,
        | "total_proctored_interviews"
        | "interviews_with_concerns"
        | "total_critical_events"
        | "avg_critical_events_per_interview"
        | "percentage_interviews_with_concerns"
      >
    >
  >
}

export type ScoreDistributionResponse = {
  data: JobAnalyticsData["score_distribution"]
}

export type TimeToHireResponse = {
  data: Array<Partial<Pick<JobAnalyticsData, "total_hires" | "avg_days_to_hire" | "median_days_to_hire">>>
}

export type InterviewCompletionResponse = {
  data: Array<Partial<Pick<JobAnalyticsData, "completion_rate" | "abandonment_rate">>>
}

export type InterviewTimelineResponse = {
  data: Array<{
    interview_date_distribution: JobAnalyticsData["interview_date_distribution"] | string
    interview_time_distribution: JobAnalyticsData["interview_time_distribution"] | string
  }>
}

export type ProctoringEventsResponse = {
  data: ProctoringEvent[]
}

export type SectionPerformanceResponse = {
  data: SectionPerformance[]
}
