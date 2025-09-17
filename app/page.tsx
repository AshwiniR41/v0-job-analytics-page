import { JobAnalyticsModule } from "../src/modules/job-analytics/job-analytics-module"

// You can pass a jobId if you navigate with params in your app.
// For demo purposes we render without a jobId which shows "No Analytics Data" in mock mode.
export default function Page() {
  return (
    <main className="p-6">
      <JobAnalyticsModule jobId="123" />
    </main>
  )
}
