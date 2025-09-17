import { Users, Star, Clock } from "lucide-react"
import type { SectionPerformance } from "../types"

export default function SectionPerformanceTable({ sections }: { sections: SectionPerformance[] }) {
  const renderStarRating = (rating: number | null) => {
    if (rating === null) return "—"

    const numRating = Number(rating)
    const fullStars = Math.floor(numRating)
    const hasHalfStar = numRating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-3 w-3 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />
        ))}
        <span className="ml-1 text-xs text-gray-600">({numRating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="px-3 py-2">Section</th>
            <th className="px-3 py-2">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Total
              </div>
            </th>
            <th className="px-3 py-2">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-green-600" />
                Evaluated
              </div>
            </th>
            <th className="px-3 py-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Avg Rating
              </div>
            </th>
            <th className="px-3 py-2">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-orange-600" />
                Avg Duration (min)
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sections.map((s, idx) => (
            <tr key={`${s.section_key}-${idx}`} className="text-gray-900">
              <td className="px-3 py-2">
                <div className="flex flex-col">
                  <span className="font-medium">{s.section_type}</span>
                  <span className="text-gray-500 text-xs">{s.section_key}</span>
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  {s.total_sections}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-green-600" />
                  {s.evaluated_sections}
                </div>
              </td>
              <td className="px-3 py-2">{renderStarRating(s.avg_section_rating)}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-600" />
                  {s.avg_duration_minutes === null ? "—" : Number(s.avg_duration_minutes).toFixed(1)}
                </div>
              </td>
            </tr>
          ))}
          {sections.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-gray-500">
                No section performance data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
