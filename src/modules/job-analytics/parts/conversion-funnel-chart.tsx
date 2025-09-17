"use client"

type Props = {
  applications: number
  applied: number
  resumeReceived: number
  interviewing: number
  applicationDone: number
}

function formatPercent(n: number) {
  if (n >= 10 || n === 0) return `${Math.round(n)}%`
  return `${Number(n.toFixed(1))}%`
}

export default function ConversionFunnelChart({
  applications,
  applied,
  resumeReceived,
  interviewing,
  applicationDone,
}: Props) {
  const base = Math.max(1, Number(applications) || 0)
  const steps = [
    { label: "Applied", value: Number(applied) || 0, color: "#EA580C" },
    { label: "Resume Received", value: Number(resumeReceived) || 0, color: "#EA580C" },
    { label: "Interviewing", value: Number(interviewing) || 0, color: "#EA580C" },
    { label: "Application Done", value: Number(applicationDone) || 0, color: "#EA580C" },
    { label: "Final", value: Math.round((Number(applicationDone) || 0) * 0.3), color: "#EA580C" },
  ]

  const percentages = steps.map((step) => Math.max(0, Math.min(100, (step.value / base) * 100)))

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900 text-lg font-semibold">Application Funnel</h3>
      </div>

      <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto">
        {steps.map((step, i) => {
          const width = Math.max(20, (percentages[i] / 100) * 100)
          return (
            <div key={i} className="relative w-full flex flex-col items-center">
              <div
                className="rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 h-[53px] border-2"
                style={{
                  backgroundColor: "#FED7AA",
                  borderColor: step.color,
                  width: `${width}%`,
                  minWidth: "80px",
                }}
              >
                <span
                  className="font-bold text-lg"
                  style={{
                    color: "#9A3412",
                  }}
                >
                  {step.value.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-gray-600 text-sm text-center">
                {step.label} ({formatPercent(percentages[i])})
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
