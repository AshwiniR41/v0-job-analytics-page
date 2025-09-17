export type Job = {
  id: string
  title: string
  description: string
  short_description?: string | null
  uploaded_job_description?: string | null
  key_skills: string[]
  experience?: string | null
  location?: string | null
  type_of_job: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"
  industry?: string | null
  custom_tags?: Array<{
    label: string
    color?: string
    icon?: string
  }>
  visibility: "PUBLIC" | "PRIVATE"
  created_at: string
  updated_at: string
  is_active: boolean
  applications_last_n_hours: number
  total_applications: number
  interview_link?: string | null
}

export type JobAnalyticsData = {
  // Interview Metrics
  avg_interview_rating: number | null
  total_interviews: number
  rated_interviews: number
  avg_duration_minutes: number | null
  completed_interviews: number

  // Application Conversion Metrics
  total_applications: number
  applied_count: number
  resume_received_count: number
  interviewing_count: number
  application_done_count: number
  applied_to_resume_rate: number
  resume_to_interview_rate: number
  interview_to_done_rate: number
  overall_conversion_rate: number

  // Proctoring Metrics
  total_proctored_interviews: number
  interviews_with_concerns: number
  total_critical_events: number
  avg_critical_events_per_interview: number
  percentage_interviews_with_concerns: number

  // Score Distribution
  score_distribution: Array<{
    rating_bucket: string
    candidate_count: number
    percentage: number
    avg_rating_in_bucket: number
  }>

  // Interview Timeline Data
  interview_date_distribution: Array<{
    date: string
    candidate_count: number
  }>
  interview_time_distribution: Array<{
    hour: number
    candidate_count: number
  }>

  // Time to Hire
  total_hires: number
  avg_days_to_hire: number | null
  median_days_to_hire: number | null

  // Interview Abandonment
  completion_rate: number
  abandonment_rate: number
}

export type ProctoringEvent = {
  event_type: string
  event_count: number
  interviews_affected: number
  avg_time_in_interview_minutes: number | null
}

export type SectionPerformance = {
  section_type: string
  section_key: string
  total_sections: number
  evaluated_sections: number
  avg_section_rating: number | null
  avg_duration_minutes: number | null
}
