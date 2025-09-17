import type React from "react"

type Props = {
  title: string
  value: string | number
  icon?: React.ReactNode
  subtitle?: string
  color?: "blue" | "green" | "purple" | "red" | "orange"
  compact?: boolean
}

const colorMap: Record<NonNullable<Props["color"]>, string> = {
  blue: "text-blue-600 bg-blue-50",
  green: "text-green-600 bg-green-50",
  purple: "text-purple-600 bg-purple-50",
  red: "text-red-600 bg-red-50",
  orange: "text-orange-600 bg-orange-50",
}

export default function MetricCard({ title, value, icon, subtitle, color = "blue", compact = false }: Props) {
  const colorCls = colorMap[color]
  return (
    
  )
}
