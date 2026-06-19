"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SimpleProgressCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Simple Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Primary */}
        <Progress value={40} className="h-2" />

        {/* Success */}
        <Progress value={50} className="h-2" />

        {/* Info */}
        <Progress value={60} className="h-2" />

        {/* Warning */}
        <Progress value={70} className="h-2" />

        {/* Danger */}
        <Progress value={80} className="h-2" />

      </CardContent>
    </Card>
  )
}
