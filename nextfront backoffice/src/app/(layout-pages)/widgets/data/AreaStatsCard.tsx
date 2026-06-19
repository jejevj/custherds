import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts"

const areaData = [
  { value: 30 },
  { value: 45 },
  { value: 35 },
  { value: 65 },
  { value: 40 },
  { value: 80 },
  { value: 50 },
]

export default function AreaStatsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-semibold text-muted-foreground">
          Total Revenue
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">$18.4K</h2>

          <p className="text-md text-foreground">
            +7.8% from last week
          </p>
        </div>

        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="var(--chart-1)"
                fillOpacity={0.08}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}