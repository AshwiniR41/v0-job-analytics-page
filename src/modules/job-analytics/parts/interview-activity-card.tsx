"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DateBucket = { date: string; count: number }
type TimeBucket = { hour?: number; time?: string; count: number }

function formatHour(bucket: TimeBucket) {
  if (typeof bucket.hour === "number") {
    const h = bucket.hour
    const ampm = h >= 12 ? "PM" : "AM"
    const display = `${((h + 11) % 12) + 1}${ampm}`
    return display
  }
  if (bucket.time) return bucket.time
  return "—"
}

function getPeak<T extends { count: number }>(arr: T[]): T | undefined {
  return arr.reduce<T | undefined>((acc, cur) => {
    if (!acc || cur.count > acc.count) return cur
    return acc
  }, undefined)
}

function getQuiet<T extends { count: number }>(arr: T[]): T | undefined {
  const nonZero = arr.filter((a) => a.count > 0)
  const target = nonZero.length ? nonZero : arr
  return target.reduce<T | undefined>((acc, cur) => {
    if (!acc || cur.count < acc.count) return cur
    return acc
  }, undefined)
}

function WeeklyBarChart({ dateDistribution }: { dateDistribution: DateBucket[] }) {
  const weeklyData = [
    { day: "Mon", count: 2000 },
    { day: "Tue", count: 500 },
    { day: "Wed", count: 1023 },
    { day: "Thu", count: 3500 },
    { day: "Fri", count: 2800 },
    { day: "Sat", count: 10000 },
    { day: "Sun", count: 1200 },
  ]

  const maxCount = Math.max(1, ...weeklyData.map((d) => d.count))
  const peakDayIndex = weeklyData.findIndex((d) => d.count === maxCount)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-32 px-2">
        {weeklyData.map((data, index) => {
          const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0
          const isPeak = index === peakDayIndex && data.count > 0

          return (
            <div key={data.day} className="flex flex-col items-center flex-1">
              {/* Count above bar */}
              <div className="text-xs font-medium text-foreground mb-1 h-4">
                {data.count >= 1000 ? `${(data.count / 1000).toFixed(data.count % 1000 === 0 ? 0 : 1)}k` : data.count}
              </div>

              {/* Bar */}
              <div className="w-full flex flex-col justify-end h-24">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPeak ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-400 hover:bg-gray-500"
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${data.day}: ${data.count} interviews`}
                />
              </div>

              {/* Day label */}
              <div className="text-xs mt-2 font-medium text-slate-400">{data.day}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HourlyTimelineChart({ timeDistribution }: { timeDistribution: TimeBucket[] }) {
  const hourlyData = [
    { hour: "12AM", count: 50 },
    { hour: "1AM", count: 20 },
    { hour: "2AM", count: 10 },
    { hour: "3AM", count: 5 },
    { hour: "4AM", count: 8 },
    { hour: "5AM", count: 15 },
    { hour: "6AM", count: 45 },
    { hour: "7AM", count: 120 },
    { hour: "8AM", count: 280 },
    { hour: "9AM", count: 450 },
    { hour: "10AM", count: 680 },
    { hour: "11AM", count: 520 },
    { hour: "12PM", count: 380 },
    { hour: "1PM", count: 420 },
    { hour: "2PM", count: 650 },
    { hour: "3PM", count: 780 },
    { hour: "4PM", count: 590 },
    { hour: "5PM", count: 320 },
    { hour: "6PM", count: 180 },
    { hour: "7PM", count: 90 },
    { hour: "8PM", count: 60 },
    { hour: "9PM", count: 40 },
    { hour: "10PM", count: 25 },
    { hour: "11PM", count: 35 },
  ]

  const maxCount = Math.max(1, ...hourlyData.map((d) => d.count))
  const peakHourIndex = hourlyData.findIndex((d) => d.count === maxCount)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-1 h-32 px-2 overflow-x-auto">
        {hourlyData.map((data, index) => {
          const height = maxCount > 0 ? (data.count / maxCount) * 100 : 0
          const isPeak = index === peakHourIndex && data.count > 0

          return (
            <div key={data.hour} className="flex flex-col items-center flex-shrink-0" style={{ minWidth: "24px" }}>
              {/* Count above bar */}
              <div className="text-xs font-medium text-foreground mb-1 h-4">
                {data.count >= 1000 ? `${(data.count / 1000).toFixed(data.count % 1000 === 0 ? 0 : 1)}k` : data.count}
              </div>

              {/* Bar */}
              <div className="w-full flex flex-col justify-end h-24">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPeak ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-400 hover:bg-gray-500"
                  }`}
                  style={{ height: `${height}%`, minWidth: "16px" }}
                  title={`${data.hour}: ${data.count} interviews`}
                />
              </div>

              {/* Hour label */}
              <div className="text-xs text-muted-foreground mt-2 font-medium transform -rotate-45 origin-center whitespace-nowrap">
                {data.hour}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function InterviewActivityCard({
  dateDistribution = [],
  timeDistribution = [],
}: {
  dateDistribution?: DateBucket[]
  timeDistribution?: TimeBucket[]
}) {
  const peakDay = getPeak(dateDistribution)
  const quietDay = getQuiet(dateDistribution)
  const peakHour = getPeak(timeDistribution)
  const quietHour = getQuiet(timeDistribution)

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-all duration-200 h-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-balance text-lg">Interview Activity</CardTitle>
        <CardDescription className="text-pretty text-sm text-gray-600">
          Weekly interview patterns showing activity trends by day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            
            <WeeklyBarChart dateDistribution={dateDistribution} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InterviewActivityCard
