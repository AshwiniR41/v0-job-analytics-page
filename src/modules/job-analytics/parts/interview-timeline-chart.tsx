"use client"

import { useMemo } from "react"

type DatePoint = { date: string; candidate_count: number }
type TimePoint = { hour: number; candidate_count: number }

type Props =
  | { type: "date"; dateDistribution: DatePoint[]; timeDistribution?: never }
  | { type: "time"; timeDistribution: TimePoint[]; dateDistribution?: never }

export default function InterviewTimelineChart(props: Props) {
  const items = useMemo(() => {
    if (props.type === "date") {
      return [...props.dateDistribution].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    return [...props.timeDistribution].sort((a, b) => a.hour - b.hour)
  }, [props.dateDistribution, props.timeDistribution])

  const max = Math.max(1, ...items.map((i) => i.candidate_count))
  const W = 480
  const H = 160
  const pad = 24
  const n = items.length

  const xPos = (idx: number) => {
    if (n <= 1) return pad
    const step = (W - pad * 2) / (n - 1)
    return pad + idx * step
  }
  const yPos = (v: number) => {
    const usable = H - pad * 2
    return H - pad - (v / max) * usable
  }

  const points = items.map((it, i) => `${xPos(i)},${yPos(it.candidate_count)}`).join(" ")
  const areaPath = n > 0 ? `M ${xPos(0)},${H - pad} L ${points.replace(/ /g, " L ")} L ${xPos(n - 1)},${H - pad} Z` : ""

  return (
    <div className="space-y-2">
      <svg
        role="img"
        aria-label="Interview timeline"
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="text-blue-600"
      >
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#E5E7EB" />
        {n > 1 && <path d={areaPath} fill="rgba(37, 99, 235, 0.12)" />}
        {n > 1 && <polyline points={points} fill="none" stroke="currentColor" strokeWidth={2} />}
        {items.map((it, i) => (
          <circle
            key={props.type === "date" ? it.date : (it as TimePoint).hour}
            cx={xPos(i)}
            cy={yPos(it.candidate_count)}
            r={3}
            fill="currentColor"
          />
        ))}
        {items.map((it, i) => (
          <text key={`label-${i}`} x={xPos(i)} y={H - pad + 12} textAnchor="middle" fontSize="10" fill="#6B7280">
            {props.type === "date"
              ? new Date((it as DatePoint).date).toLocaleDateString()
              : `${String((it as TimePoint).hour).padStart(2, "0")}:00`}
          </text>
        ))}
      </svg>
      {items.length === 0 && <div className="text-sm text-gray-500">No timeline data.</div>}
    </div>
  )
}
