import type {
  ApplicationConversionResponse,
  InterviewCompletionResponse,
  InterviewMetricsResponse,
  InterviewTimelineResponse,
  ProctoringEventsResponse,
  ProctoringMetricsResponse,
  ScoreDistributionResponse,
  SectionPerformanceResponse,
  TimeToHireResponse,
} from "../types"

export const mockInterviewMetrics = (): InterviewMetricsResponse => ({
  data: [
    {
      avg_interview_rating: null,
      total_interviews: 0,
      rated_interviews: 0,
      avg_duration_minutes: null,
      completed_interviews: 0,
    },
  ],
})

export const mockApplicationConversion = (): ApplicationConversionResponse => ({
  data: [
    {
      total_applications: 0,
      applied_count: 0,
      resume_received_count: 0,
      interviewing_count: 0,
      application_done_count: 0,
      applied_to_resume_rate: 0,
      resume_to_interview_rate: 0,
      interview_to_done_rate: 0,
      overall_conversion_rate: 0,
    },
  ],
})

export const mockProctoringMetrics = (): ProctoringMetricsResponse => ({
  data: [
    {
      total_proctored_interviews: 0,
      interviews_with_concerns: 0,
      total_critical_events: 0,
      avg_critical_events_per_interview: 0,
      percentage_interviews_with_concerns: 0,
    },
  ],
})

export const mockScoreDistribution = (): ScoreDistributionResponse => ({
  data: [],
})

export const mockTimeToHire = (): TimeToHireResponse => ({
  data: [
    {
      total_hires: 0,
      avg_days_to_hire: null,
      median_days_to_hire: null,
    },
  ],
})

export const mockInterviewCompletion = (): InterviewCompletionResponse => ({
  data: [
    {
      completion_rate: 0,
      abandonment_rate: 0,
    },
  ],
})

export const mockInterviewTimeline = (): InterviewTimelineResponse => ({
  data: [
    {
      interview_date_distribution: [],
      interview_time_distribution: [],
    },
  ],
})

export const mockProctoringEvents = (): ProctoringEventsResponse => ({
  data: [],
})

export const mockSectionPerformance = (): SectionPerformanceResponse => ({
  data: [],
})
