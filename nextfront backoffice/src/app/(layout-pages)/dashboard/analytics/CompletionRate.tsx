"use client"

import {ArrowUp, ShieldHalf, Leaf, Lightbulb, EllipsisVertical,
        LogOutIcon, SettingsIcon, UserIcon, CreditCardIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export const description = "A bar chart with completion rate"

const chartData = [
  { month: "Jan", visitors: 120},
  { month: "Feb", visitors: 180},
  { month: "Mar", visitors: 240},
  { month: "Apr", visitors: 210},
  { month: "May", visitors: 275},
  { month: "Jun", visitors: 190},
]

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function CompletionRate() {
  return (
    <Card className="h-auto w-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <p className="text-md font-medium text-muted-foreground">Completion Rate</p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="text-4xl font-semibold">87%</h2>
            <span className="flex items-center gap-1 text-sm font-medium text-primary-600">
              <ArrowUp className="h-4 w-4" />
              25.8%
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full [&_svg]:size-5"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              View detailed report
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCardIcon className="mr-2 h-4 w-4" />
              Download report
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Export as CSV / PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Refresh data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        {/* Mini bar chart */}
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            barSize={30}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Bar
              dataKey="visitors"
              radius={[10, 10, 0, 0]}
              fill={chartConfig.visitors.color}
            />
          </BarChart>
        </ChartContainer>

        {/* Stats */}
        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <ShieldHalf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-xs text-muted-foreground">
                  Last 7 days
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-primary-600">+126</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Resolved Items</p>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </div>
            </div>
            <span className="text-sm font-medium text-primary-600">+98</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                   <Leaf className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-medium">Follow-ups Created</p>
                    <p className="text-xs text-muted-foreground">
                        Last 7 days
                    </p>
                </div>
            </div>
            <span className="text-sm font-medium text-primary-600">+42</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
