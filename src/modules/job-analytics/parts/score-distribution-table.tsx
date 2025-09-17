"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from "recharts"

type Bucket = {
  rating_bucket: string
  candidate_count: number
  percentage: number
  avg_rating_in_bucket: number
}

export default function ScoreDistributionTable({ scoreDistribution = [] }: { scoreDistribution?: Bucket[] }) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (scoreDistribution.length > 0) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [scoreDistribution])

  const calculateMode = () => {
    if (scoreDistribution.length === 0) return 2.5
    const modeBucket = scoreDistribution.reduce((max, bucket) =>
      bucket.candidate_count > max.candidate_count ? bucket : max,
    )
    return modeBucket.avg_rating_in_bucket || 2.5
  }

  const calculateMedian = () => {
    if (scoreDistribution.length === 0) return 2.5
    const totalCandidates = scoreDistribution.reduce((sum, bucket) => sum + bucket.candidate_count, 0)
    const midpoint = totalCandidates / 2

    let runningCount = 0
    for (const bucket of scoreDistribution) {
      runningCount += bucket.candidate_count
      if (runningCount >= midpoint) {
        return bucket.avg_rating_in_bucket
      }
    }
    return 2.5
  }

  const mode = calculateMode()
  const median = calculateMedian()
  const total = scoreDistribution.reduce((sum, bucket) => sum + bucket.candidate_count, 0)

  const chartData = scoreDistribution.map((bucket) => ({
    rating: bucket.rating_bucket,
    count: bucket.candidate_count,
    percentage: bucket.percentage,
    isMode: bucket.avg_rating_in_bucket === mode,
    fill: bucket.avg_rating_in_bucket === mode ? "#ea580c" : "#fb923c", // Orange-600 for mode, orange-400 for others
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Rating: ${label}`}</p>
          <p className="text-orange-600">{`Candidates: ${data.count}`}</p>
          <p className="text-gray-600">{`Percentage: ${data.percentage}%`}</p>
          {data.isMode && <p className="text-orange-800 font-medium text-xs mt-1">Mode (Most Frequent)</p>}
        </div>
      )
    }
    return null
  }

  const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props
    if (value === 0) return null // Don't show label for zero values

    return (
      <text x={x + width / 2} y={y - 5} fill="#374151" textAnchor="middle" fontSize="11" fontWeight="500">
        {value}
      </text>
    )
  }

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      )}

      {scoreDistribution.length > 0 ? (
        <div className="space-y-4">
          {/* Summary Statistics */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gray-50 rounded-lg p-3 lg:p-4 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <div className="text-lg lg:text-xl font-bold text-gray-900">Score Distribution</div>
              </div>
              <div className="hidden sm:block h-8 w-px bg-gray-300"></div> {/* Divider - hidden on mobile */}
              <div className="flex justify-center sm:justify-start gap-6">
                <div className="text-center">
                  <div className="text-base lg:text-lg font-semibold text-gray-900">{total}</div>
                  <div className="text-xs text-gray-500">Total Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-base lg:text-lg font-semibold text-blue-600">{median.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Central Value</div>
                </div>
                <div className="text-center">
                  <div className="text-base lg:text-lg font-semibold text-orange-600">{mode.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">Most Frequent Score</div>
                </div>
              </div>
            </div>
            {/* Color indicators */}
            <div className="flex items-center justify-center lg:justify-end gap-3 lg:gap-4 text-xs lg:text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span className="text-gray-600">Frequency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded"></div>
                <span className="text-gray-600">Most Frequent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-blue-600"></div>
                <span className="text-gray-600">Central Value </span>
              </div>
            </div>
          </div>

          {/* Chart container */}
          <div className="bg-white rounded-lg border border-gray-200 p-2 lg:p-4">
            <div className="h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 8,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="rating"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    label={{
                      value: "Rating",
                      position: "insideBottom",
                      offset: -5,
                      textAnchor: "middle",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    width={40}
                    label={{
                      value: "Number of Candidates",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fontSize: 12 },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    x={median.toString()}
                    stroke="#2563eb"
                    strokeDasharray="5 5"
                    label={{ value: "Central Value", position: "top", fill: "#2563eb", fontSize: 10 }}
                  />
                  <Bar dataKey="count" fill="#fb923c" radius={[2, 2, 0, 0]}>
                    <LabelList content={<CustomLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <p className="text-sm text-gray-500">No score data available yet</p>
            <p className="text-xs text-gray-400 mt-1">Scores will appear as candidates are evaluated</p>
          </div>
        </div>
      )}
    </div>
  )
}
