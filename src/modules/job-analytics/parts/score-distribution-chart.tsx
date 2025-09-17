"use client"

import { useState, useEffect } from "react"

type Bucket = {
  rating_bucket: string
  candidate_count: number
  percentage: number
  avg_rating_in_bucket: number
}

export default function ScoreDistributionChart({ scoreDistribution = [] }: { scoreDistribution?: Bucket[] }) {
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
  const maxCount = Math.max(...scoreDistribution.map((bucket) => bucket.candidate_count), 1)

  return (
    <div className="space-y-6">
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
        <div className="space-y-6">
          {/* Histogram Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-4">
              {/* Chart Area */}
              <div className="relative h-64">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-500">
                  <span>{maxCount}</span>
                  <span>{Math.round(maxCount * 0.75)}</span>
                  <span>{Math.round(maxCount * 0.5)}</span>
                  <span>{Math.round(maxCount * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Chart bars */}
                <div className="ml-10 mr-4 h-full relative">
                  <div className="flex items-end justify-between h-full pb-8">
                    {scoreDistribution.map((bucket, index) => {
                      const barHeight = (bucket.candidate_count / maxCount) * 200
                      const isMode = bucket.avg_rating_in_bucket === mode
                      const isMedianBucket = bucket.avg_rating_in_bucket === median

                      return (
                        <div key={index} className="flex flex-col items-center flex-1 mx-1">
                          {/* Candidate count label above bar */}
                          <div className="mb-2 h-6 flex items-end">
                            {bucket.candidate_count > 0 && (
                              <span className="text-sm font-semibold text-gray-700">{bucket.candidate_count}</span>
                            )}
                          </div>

                          {/* Bar */}
                          <div
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              isMode ? "bg-orange-500" : isMedianBucket ? "bg-blue-500" : "bg-gray-400"
                            }`}
                            style={{ height: `${barHeight}px` }}
                          />

                          {/* Percentage label */}
                          <div className="mt-2 text-xs text-gray-500">{bucket.percentage}%</div>

                          {/* Rating bucket label */}
                          <div className="mt-1 text-sm font-medium text-gray-700">{bucket.rating_bucket}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* X-axis line */}
                  <div className="absolute bottom-8 left-0 right-0 h-px bg-gray-300"></div>
                </div>
              </div>

              {/* Legend and Statistics */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-sm text-gray-600">Mode: {mode.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">Median: {median.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span className="text-sm text-gray-600">Other Ranges</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Total Candidates: {total}</div>
              </div>
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
