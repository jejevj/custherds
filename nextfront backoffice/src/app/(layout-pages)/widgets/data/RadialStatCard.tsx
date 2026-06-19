"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarGrid,
} from "recharts"
import { ArrowUpRight } from "lucide-react"

interface RadialStatCardProps {
  title: string
  subtitle?: string
  value: number
  label: string
  trend?: string
}

export default function RadialStatCard({
  title,
  subtitle = "January – June 2024",
  value,
  label,
  trend = "Trending up",
}: RadialStatCardProps) {
  const data = [{ value }]

  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border">
          <ArrowUpRight className="h-5 w-5 text-foreground" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6 p-6">
        {/* Chart */}
        <div className="relative h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={data}
              startAngle={0}
              endAngle={250}
              innerRadius={80}
              outerRadius={110}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[86, 74]}
              />

              <RadialBar
                dataKey="value"
                cornerRadius={999}
                fill="var(--chart-1)"
              />
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">
              {value}
            </span>

            <span className="text-sm text-muted-foreground">
              {label}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
            {trend}
            <ArrowUpRight className="h-4 w-4" />
          </div>

          <p className="text-xs text-muted-foreground">
            Showing total visitors for the last 6 months
          </p>
        </div>
      </CardContent>
    </Card>
  )
}