import type { JobAnalyticsData, ProctoringEvent, SectionPerformance } from "../types"

export const dummyAnalytics: JobAnalyticsData = {
  // Interview Metrics
  avg_interview_rating: 4.2,
  total_interviews: 58,
  rated_interviews: 51,
  avg_duration_minutes: 47,
  completed_interviews: 49,

  // Application Conversion Metrics
  total_applications: 128,
  applied_count: 128,
  resume_received_count: 92,
  interviewing_count: 34,
  application_done_count: 18,
  applied_to_resume_rate: Math.round((92 / 128) * 100),
  resume_to_interview_rate: Math.round((34 / 92) * 100),
  interview_to_done_rate: Math.round((18 / 34) * 100),
  overall_conversion_rate: Math.round((18 / 128) * 100),

  // Proctoring Metrics
  total_proctored_interviews: 40,
  interviews_with_concerns: 7,
  total_critical_events: 13,
  avg_critical_events_per_interview: Number((13 / 40).toFixed(2)),
  percentage_interviews_with_concerns: Math.round((7 / 40) * 100),

  // Score Distribution
  score_distribution: [
    { rating_bucket: "0.25", candidate_count: 3, percentage: 3, avg_rating_in_bucket: 0.25 },
    { rating_bucket: "0.5", candidate_count: 8, percentage: 8, avg_rating_in_bucket: 0.5 },
    { rating_bucket: "0.75", candidate_count: 1, percentage: 1, avg_rating_in_bucket: 0.75 },
    { rating_bucket: "1.0", candidate_count: 8, percentage: 8, avg_rating_in_bucket: 1.0 },
    { rating_bucket: "1.25", candidate_count: 7, percentage: 7, avg_rating_in_bucket: 1.25 },
    { rating_bucket: "1.5", candidate_count: 4, percentage: 4, avg_rating_in_bucket: 1.5 },
    { rating_bucket: "1.75", candidate_count: 2, percentage: 2, avg_rating_in_bucket: 1.75 },
    { rating_bucket: "2.0", candidate_count: 9, percentage: 9, avg_rating_in_bucket: 2.0 },
    { rating_bucket: "2.25", candidate_count: 6, percentage: 6, avg_rating_in_bucket: 2.25 },
    { rating_bucket: "2.5", candidate_count: 3, percentage: 3, avg_rating_in_bucket: 2.5 },
    { rating_bucket: "2.75", candidate_count: 4, percentage: 4, avg_rating_in_bucket: 2.75 },
    { rating_bucket: "3.0", candidate_count: 4, percentage: 4, avg_rating_in_bucket: 3.0 },
    { rating_bucket: "3.25", candidate_count: 5, percentage: 5, avg_rating_in_bucket: 3.25 },
    { rating_bucket: "3.5", candidate_count: 3, percentage: 3, avg_rating_in_bucket: 3.5 },
    { rating_bucket: "3.75", candidate_count: 5, percentage: 5, avg_rating_in_bucket: 3.75 },
    { rating_bucket: "4.0", candidate_count: 6, percentage: 6, avg_rating_in_bucket: 4.0 },
    { rating_bucket: "4.25", candidate_count: 2, percentage: 2, avg_rating_in_bucket: 4.25 },
    { rating_bucket: "4.5", candidate_count: 4, percentage: 4, avg_rating_in_bucket: 4.5 },
    { rating_bucket: "4.75", candidate_count: 8, percentage: 8, avg_rating_in_bucket: 4.75 },
    { rating_bucket: "5.0", candidate_count: 5, percentage: 5, avg_rating_in_bucket: 5.0 },
  ],

  // Interview Timeline Data
  interview_date_distribution: [
    { date: "2025-08-01", candidate_count: 6 },
    { date: "2025-08-02", candidate_count: 9 },
    { date: "2025-08-03", candidate_count: 3 },
    { date: "2025-08-04", candidate_count: 12 },
    { date: "2025-08-05", candidate_count: 7 },
  ],
  interview_time_distribution: [
    { hour: 9, candidate_count: 6 },
    { hour: 10, candidate_count: 10 },
    { hour: 11, candidate_count: 8 },
    { hour: 14, candidate_count: 11 },
    { hour: 16, candidate_count: 5 },
  ],

  // Time to Hire
  total_hires: 3,
  avg_days_to_hire: 19,
  median_days_to_hire: 17,

  // Interview Abandonment
  completion_rate: 82,
  abandonment_rate: 18,
}

export const dummyProctoringEvents: ProctoringEvent[] = [
  { event_type: "TAB_SWITCH", event_count: 12, interviews_affected: 7, avg_time_in_interview_minutes: 2 },
  { event_type: "FACE_NOT_DETECTED", event_count: 5, interviews_affected: 4, avg_time_in_interview_minutes: 1 },
  { event_type: "MULTIPLE_FACES", event_count: 4, interviews_affected: 2, avg_time_in_interview_minutes: 3 },
]

export const dummySectionPerformance: SectionPerformance[] = [
  {
    section_type: "MCQ",
    section_key: "technical_mcq",
    total_sections: 120,
    evaluated_sections: 118,
    avg_section_rating: 3.6,
    avg_duration_minutes: 18,
  },
  {
    section_type: "CODING",
    section_key: "coding_round",
    total_sections: 82,
    evaluated_sections: 80,
    avg_section_rating: 3.3,
    avg_duration_minutes: 42,
  },
  {
    section_type: "SYSTEM_DESIGN",
    section_key: "system_design",
    total_sections: 54,
    evaluated_sections: 52,
    avg_section_rating: 3.1,
    avg_duration_minutes: 50,
  },
  {
    section_type: "BEHAVIORAL",
    section_key: "behavioral",
    total_sections: 96,
    evaluated_sections: 94,
    avg_section_rating: 4.0,
    avg_duration_minutes: 25,
  },
]
