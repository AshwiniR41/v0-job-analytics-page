import type { ProctoringEvent } from "../types"

export default function ProctoringEventsTable({ events }: { events: ProctoringEvent[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="px-3 py-2">Event Type</th>
            <th className="px-3 py-2">Event Count</th>
            <th className="px-3 py-2">Interviews Affected</th>
            <th className="px-3 py-2">Avg Time (min)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((e, idx) => (
            <tr key={`${e.event_type}-${idx}`} className="text-gray-900">
              <td className="px-3 py-2 capitalize">{e.event_type.replaceAll("_", " ")}</td>
              <td className="px-3 py-2">{e.event_count}</td>
              <td className="px-3 py-2">{e.interviews_affected}</td>
              <td className="px-3 py-2">
                {e.avg_time_in_interview_minutes === null ? "—" : Number(e.avg_time_in_interview_minutes).toFixed(1)}
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-gray-500">
                No proctoring events.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
