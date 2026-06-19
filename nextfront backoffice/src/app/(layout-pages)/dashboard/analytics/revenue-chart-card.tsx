"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, XAxis } from "recharts"

import { Badge } from "@/components/ui/badge"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "An area chart with a legend"

const chartData = [
  { month: "January", desktop: 145 },
  { month: "February", desktop: 278 },
  { month: "March", desktop: 192 },
  { month: "April", desktop: 356 },
  { month: "May", desktop: 221 },
  { month: "June", desktop: 174 },
];


const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function RevenueChartCard() {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <div>
            <CardDescription className="text-lg">Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                $1,250.00
            </CardTitle>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-white-600">
            <Badge
            variant="outline"
            className="gap-1 rounded-full bg-muted"
          >
            <TrendingUp className="h-4 w-4" />
             +12.5%
          </Badge>
         </div>
        </CardHeader>
        <CardContent>
        <ChartContainer config={chartConfig} className="mt-0 h-full w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <XAxis 
              hide 
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Area
              dataKey="desktop"
              type="monotone"
              fill="var(--chart-1)"
              fillOpacity={0.08}
              stroke="var(--chart-1)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
