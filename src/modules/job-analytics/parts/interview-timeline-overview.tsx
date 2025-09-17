"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

type TimelineData = {
  hour: string
  count: number
}

function SmoothLineChart({ data }: { data: TimelineData[] }) {
  const maxCount = Math.max(1, ...data.map((d) => d.count))
  const peakIndex = data.findIndex((d) => d.count === maxCount)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  // Generate smooth curve path
  const generatePath = () => {
    if (data.length === 0) return ""

    const width = 600
    const height = 120
    const padding = 40

    const xStep = (width - padding * 2) / (data.length - 1)
    const points = data.map((d, i) => ({
      x: padding + i * xStep,
      y: height - padding - (d.count / maxCount) * (height - padding * 2),
    }))

    // Create smooth curve using quadratic bezier curves
    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]

      if (i === 1) {
        // First curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.5
        const cp1y = prev.y
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`
      } else if (i === points.length - 1) {
        // Last curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.5
        const cp1y = curr.y
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`
      } else {
        // Middle curves
        const cp1x = prev.x + (curr.x - prev.x) * 0.5
        const cp1y = prev.y + (curr.y - prev.y) * 0.3
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`
      }
    }

    return path
  }

  return (
    <div className="relative">
      <svg width="100%" height="160" viewBox="0 0 600 160" className="overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {/* Updated gradient colors from purple/pink to orange tones */}
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            {/* Updated area gradient from purple to orange */}
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Area under curve */}
        <path d={`${generatePath()} L 560 120 L 40 120 Z`} fill="url(#areaGradient)" />

        {/* Main line */}
        <path d={generatePath()} stroke="url(#lineGradient)" strokeWidth="3" fill="none" className="drop-shadow-sm" />

        {/* Data points */}
        {data.map((d, i) => {
          const x = 40 + i * ((600 - 80) / (data.length - 1))
          const y = 120 - 40 - (d.count / maxCount) * (120 - 80)
          const isPeak = i === peakIndex
          const isHovered = hoveredPoint === i

          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isPeak || isHovered ? "6" : "0"}
                fill="white"
                stroke={isPeak ? "#EA580C" : "#F97316"}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                opacity={isPeak || isHovered ? 1 : 0}
              />

              {/* Tooltip */}
              {(isPeak || isHovered) && (
                <g>
                  <rect x={x - 25} y={y - 35} width="50" height="20" rx="4" fill="#1F2937" className="drop-shadow-lg" />
                  <text x={x} y={y - 22} textAnchor="middle" className="text-xs fill-white font-medium">
                    {d.count.toLocaleString()}
                  </text>
                  <path d={`M ${x - 4} ${y - 15} L ${x} ${y - 10} L ${x + 4} ${y - 15}`} fill="#1F2937" />
                </g>
              )}
            </g>
          )
        })}

        {/* Hour labels */}
        {data.map((d, i) => {
          const x = 40 + i * ((600 - 80) / (data.length - 1))
          // Only show labels for even hours (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
          const shouldShowLabel = i % 2 === 0

          return shouldShowLabel ? (
            <text key={i} x={x} y="150" textAnchor="middle" className="text-xs fill-gray-500 font-medium">
              {d.hour}
            </text>
          ) : null
        })}
      </svg>
    </div>
  )
}

export function InterviewTimelineOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState("Hour")

  const timelineData: TimelineData[] = [
    { hour: "12AM", count: 2 },
    { hour: "1AM", count: 1 },
    { hour: "2AM", count: 0 },
    { hour: "3AM", count: 1 },
    { hour: "4AM", count: 0 },
    { hour: "5AM", count: 3 },
    { hour: "6AM", count: 8 },
    { hour: "7AM", count: 15 },
    { hour: "8AM", count: 28 },
    { hour: "9AM", count: 45 },
    { hour: "10AM", count: 62 },
    { hour: "11AM", count: 71 },
    { hour: "12PM", count: 78 },
    { hour: "1PM", count: 85 },
    { hour: "2PM", count: 92 },
    { hour: "3PM", count: 95 },
    { hour: "4PM", count: 88 },
    { hour: "5PM", count: 76 },
    { hour: "6PM", count: 58 },
    { hour: "7PM", count: 42 },
    { hour: "8PM", count: 25 },
    { hour: "9PM", count: 12 },
    { hour: "10PM", count: 8 },
    { hour: "11PM", count: 4 },
  ]

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Interview Timeline</CardTitle>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <SmoothLineChart data={timelineData} />
      </CardContent>
    </Card>
  )
}

export default InterviewTimelineOverview
