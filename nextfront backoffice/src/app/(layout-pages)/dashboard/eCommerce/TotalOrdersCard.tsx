import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Area, AreaChart, XAxis } from "recharts"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "An area chart with a legend"

const chartData = [
  { month: "January", desktop: 30 },
  { month: "February", desktop: 55 },
  { month: "March", desktop: 115 },
  { month: "April", desktop: 62 },
  { month: "May", desktop: 55 },
  { month: "June", desktop: 20 },
  { month: "July", desktop: 35 },
]

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "var(--chart-3)",
  }
} satisfies ChartConfig

export default function TottalOrdersCard() {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="mb-3">
                    <p className="text-md text-muted-foreground">Total Orders</p>
                    <h2 className="text-3xl font-semibold">8,274</h2>
                 </div>
                  <p className="text-sm flex gap-2 mb-5 text-muted-foreground">
                    <span className="text-primary font-semibold">+12.4%</span>
                    from last month
                  </p>
                <ChartContainer config={chartConfig} className="h-14 w-full">
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