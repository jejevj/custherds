"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Area, AreaChart, XAxis } from "recharts"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", visitors: 145 },
  { month: "February", visitors: 278 },
  { month: "March", visitors: 192 },
  { month: "April", visitors: 356 },
  { month: "May", visitors: 221 },
  { month: "June", visitors: 174 },
  { month: "July", visitors: 680 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export default function VisitorsCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-3">
          <p className="text-md text-muted-foreground">Visitors</p>
          <h2 className="text-3xl font-semibold">18,432</h2>
        </div>

        <p className="text-sm flex gap-2 mb-5 text-muted-foreground">
          <span className="text-primary font-semibold">+9.6%</span>
          from last month
        </p>

        <ChartContainer config={chartConfig} className="h-14 w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >

            <XAxis hide dataKey="month" />

             <Area
                  dataKey="visitors"
                  type="monotone"
                  fill="var(--chart-3)"
                  stroke="var(--chart-1)"
                  fillOpacity={0.1}
                  strokeWidth={2}
              />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
