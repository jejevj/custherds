
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Airplay, ChartColumnDecreasing, Clock, Lightbulb, TrendingDown, TrendingUp, UserPlus, UserRoundX, Users, Wallet } from "lucide-react"
import { Progress } from "@/components/ui/progress"


const iconClass =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-muted border border-border text-foreground flex-shrink-0"

const progressClass =
  "mt-2 h-1.5 bg-muted [&>div]:bg-foreground [&>div]:rounded-full"

const trendClass =
  "flex items-center text-sm text-foreground"

export default function TopTrafficChannelsCard() {

    return (
        <Card>
            <CardHeader className="space-y-0">
                <CardTitle className="text-lg">Top Traffic Channels</CardTitle>
                <CardDescription>Based on visitor data</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
                <div className="flex flex-col gap-6">

                    {/* Revenue */}
                    <div className="flex items-center gap-5">
                       <div className={iconClass}>
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div className="w-full">
                            <div className="flex items-center justify-between">
                                <span className="text-md text-muted-foreground">Revenue</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">$7,926</span>
                                    <span className={trendClass}>
                                        <TrendingUp className="mr-1 h-4 w-4" />12%
                                    </span>
                                </div>
                            </div>
                            <Progress value={60} className={progressClass} />
                        </div>
                    </div>

                    {/* Active Users */}
<div className="flex items-center gap-5">
  <div className={iconClass}>
    <UserRoundX className="h-5 w-5" />
  </div>

  <div className="w-full">
    <div className="flex items-center justify-between">
      <span className="text-md text-muted-foreground">
        Active Users
      </span>

      <div className="flex items-center gap-2">
        <span className="font-medium">428</span>

        <span className={trendClass}>
          <TrendingUp className="mr-1 h-4 w-4" />
          8%
        </span>
      </div>
    </div>

    <Progress value={75} className={progressClass} />
  </div>
</div>

{/* Bounce Rate */}
<div className="flex items-center gap-5">
  <div className={iconClass}>
    <Lightbulb className="h-5 w-5" />
  </div>

  <div className="w-full">
    <div className="flex items-center justify-between">
      <span className="text-md text-muted-foreground">
        Bounce Rate
      </span>

      <div className="flex items-center gap-2">
        <span className="font-medium">42%</span>

        <span className={trendClass}>
          <TrendingUp className="mr-1 h-4 w-4" />
          5%
        </span>
      </div>
    </div>

    <Progress value={42} className={progressClass} />
  </div>
</div>

{/* Customer Retention */}
<div className="flex items-center gap-5">
  <div className={iconClass}>
    <Airplay className="h-5 w-5" />
  </div>

  <div className="w-full">
    <div className="flex items-center justify-between">
      <span className="text-md text-muted-foreground">
        Customer Retention
      </span>

      <div className="flex items-center gap-2">
        <span className="font-medium">78%</span>

        <span className={trendClass}>
          <TrendingUp className="mr-1 h-4 w-4" />
          3%
        </span>
      </div>
    </div>

    <Progress value={78} className={progressClass} />
  </div>
</div>

{/* Average Session Duration */}
<div className="flex items-center gap-5">
  <div className={iconClass}>
    <Clock className="h-5 w-5" />
  </div>

  <div className="w-full">
    <div className="flex items-center justify-between">
      <span className="text-md text-muted-foreground">
        Avg. Session Duration
      </span>

      <div className="flex items-center gap-2">
        <span className="font-medium">5m 20s</span>

        <span className={trendClass}>
          <TrendingDown className="mr-1 h-4 w-4" />
          1m
        </span>
      </div>
    </div>

    <Progress value={65} className={progressClass} />
  </div>
</div>

{/* Conversion Rate */}
<div className="flex items-center gap-5">
  <div className={iconClass}>
    <ChartColumnDecreasing className="h-5 w-5" />
  </div>

  <div className="w-full">
    <div className="flex items-center justify-between">
      <span className="text-md text-muted-foreground">
        Conversion Rate
      </span>

      <div className="flex items-center gap-2">
        <span className="font-medium">3.6%</span>

        <span className={trendClass}>
          <TrendingDown className="mr-1 h-4 w-4" />
          2%
        </span>
      </div>
    </div>

    <Progress value={36} className={progressClass} />
  </div>
</div>

{/* New Signups */}
<div className="flex items-center gap-5">
  <div className={iconClass}>
    <UserPlus className="h-5 w-5" />
  </div>

  <div className="w-full">
    <div className="flex items-center justify-between">
      <span className="text-md text-muted-foreground">
        New Signups
      </span>

      <div className="flex items-center gap-2">
        <span className="font-medium">1,245</span>

        <span className={trendClass}>
          <TrendingUp className="mr-1 h-4 w-4" />
          12%
        </span>
      </div>
    </div>

    <Progress value={55} className={progressClass} />
  </div>
</div>

                </div>
            </CardContent>

        </Card>
    )
}
