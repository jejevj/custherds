"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
} from "lucide-react"

export function ProgressCards() {
  return (
    <div className="grid gap-6">

      {/* Total Amount Card */}
      <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <CardContent className="p-6">
          <h6 className="text-sm text-muted-foreground">
            Total amount
          </h6>

          <div className="flex items-center gap-3 mt-1">
            <h3 className="text-2xl font-bold">
              24,447
            </h3>

            <Badge className="border border-white/10 bg-white/[0.04] backdrop-blur-xl text-foreground font-semibold">
              ↑ 11%
            </Badge>
          </div>

          {/* Monochrome Progress */}
          <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-foreground/70 h-full"
              style={{ width: "35%" }}
            />
            <div
              className="bg-foreground/45 h-full"
              style={{ width: "20%" }}
            />
            <div
              className="bg-foreground/25 h-full"
              style={{ width: "10%" }}
            />
          </div>

          {/* Legends */}
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-foreground/70 rounded-full"></span>
              Income
            </span>

            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-foreground/45 rounded-full"></span>
              Expenses
            </span>

            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-foreground/25 rounded-full"></span>
              Transactions
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-foreground/70" />

            <h5 className="font-bold text-lg">
              100%
              <span className="text-muted-foreground text-sm font-normal ml-2">
                Completed
              </span>
            </h5>
          </div>

          <Progress
            value={100}
            className="mt-3 h-1.5 bg-muted [&>div]:bg-foreground"
          />
        </CardContent>
      </Card>

      {/* Not Confirmed */}
      <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-foreground/70" />

            <h5 className="font-bold text-lg">
              75%
              <span className="text-muted-foreground text-sm font-normal ml-2">
                Not Confirmed!
              </span>
            </h5>
          </div>

          <Progress
            value={75}
            className="mt-3 h-1.5 bg-muted [&>div]:bg-foreground/80"
          />
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-foreground/70" />

            <h5 className="font-bold text-lg">
              30%
              <span className="text-muted-foreground text-sm font-normal ml-2">
                Shipping...
              </span>
            </h5>
          </div>

          <Progress
            value={30}
            className="mt-3 h-1.5 bg-muted [&>div]:bg-foreground/60"
          />
        </CardContent>
      </Card>

      {/* Payment Pending */}
      <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-foreground/70" />

            <h5 className="font-bold text-lg">
              50%
              <span className="text-muted-foreground text-sm font-normal ml-2">
                Payment has not been made!
              </span>
            </h5>
          </div>

          <Progress
            value={50}
            className="mt-3 h-1.5 bg-muted [&>div]:bg-foreground/40"
          />
        </CardContent>
      </Card>

    </div>
  )
}