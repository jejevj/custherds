"use client"

import * as React from "react"
import { CircleCheckBig, ShieldHalf, OctagonX, CreditCardIcon, LogOutIcon, SettingsIcon, UserIcon, EllipsisVertical } from "lucide-react"
import { Label, Pie, PieChart, Cell } from "recharts"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

export const description = "A donut chart with text"

const chartData = [
  { status: "completed", orders: 420 },
  { status: "processing", orders: 185 },
  { status: "pending", orders: 96 },
  { status: "cancelled", orders: 54 },
  { status: "refunded", orders: 32 },
]

const chartConfig = {
  orders: {
    label: "Orders",
  },
  completed: {
    label: "Completed",
  },
  processing: {
    label: "Processing",
  },
  pending: {
    label: "Pending",
  },
  cancelled: {
    label: "Cancelled",
  },
  refunded: {
    label: "Refunded",
  },
} satisfies ChartConfig


const colorMap: Record<string, string> = {
  completed: "var(--chart-1)",
  processing: "var(--chart-2)",
  pending: "var(--chart-3)",
  cancelled: "var(--chart-4)",
  refunded: "var(--chart-5)",
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      {payload.map((entry: any, index: number) => {
        const key = entry.name.toLowerCase() // 👈 IMPORTANT
        const color = colorMap[key] || "var(--muted-foreground)" // Fallback color

        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            
            {/* ✅ Correct gradient */}
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: color
              }}
            />

            <span className="text-muted-foreground">
              {entry.name}
            </span>

            <span className="font-medium ml-auto">
              {entry.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}


export default function OrderStatus() {
    const totalOrders = React.useMemo(() => {
  return chartData.reduce((acc, curr) => acc + curr.orders, 0)
}, [])


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b py-3">
                <div>
                    <CardTitle className="text-lg mb-0">Order Status</CardTitle>
                    <CardDescription>
                        Order distribution in last 3 months
                    </CardDescription>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full [&_svg]:size-5">
                            <EllipsisVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            <UserIcon />
                            View detailed report
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CreditCardIcon />
                            Download report
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <SettingsIcon />
                            Export as CSV / PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LogOutIcon />
                            Refresh data
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[280] w-full mx-auto"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<CustomTooltip />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="orders"     // ✅ FIX
                            nameKey="status"     // ✅ FIX
                            innerRadius={80}
                            outerRadius={115}
                            stroke="hsl(var(--background))"
                            strokeWidth={1}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`var(--chart-${index + 1})`}
                                />
                            ))}

                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalOrders.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy ?? 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Visitors
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>

                {/* Stats */}
                <div className="mt-8 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-600">
                                <CircleCheckBig className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Completed Orders</p>
                                <p className="text-xs text-muted-foreground">Last 7 days</p>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-primary-600">+128</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-600">
                                <ShieldHalf className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Processing Orders</p>
                                <p className="text-xs text-muted-foreground">Currently active</p>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-primary-600">46</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-600">
                                <OctagonX className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Cancelled / Refunded</p>
                                <p className="text-xs text-muted-foreground">Last 7 days</p>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-primary-500">-12</span>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
