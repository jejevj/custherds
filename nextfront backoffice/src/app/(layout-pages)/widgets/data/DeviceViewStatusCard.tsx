import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Smartphone, Tablet, Laptop } from "lucide-react"

export default function DeviceViewStatusCard() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-semibold">
          Device View Status
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Total Traffic */}
        <div className="flex items-end gap-2">
          <h2 className="text-3xl font-bold">72%</h2>
          <span className="text-sm text-muted-foreground">
            Total traffic
          </span>
        </div>

        {/* Progress Segments */}
        <div className="space-y-2">
          <div className="flex gap-1 w-full">
            <div
              className="h-2 rounded-full w-[45%]"
              style={{ backgroundColor: "var(--chart-1)" }}
            />

            <div
              className="h-2 rounded-full w-[30%]"
              style={{ backgroundColor: "var(--chart-2)" }}
            />

            <div
              className="h-2 rounded-full w-[25%]"
              style={{ backgroundColor: "var(--chart-3)" }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>45%</span>
            <span>30%</span>
            <span>25%</span>
          </div>
        </div>

        {/* Device Stats */}
        <div className="grid grid-cols-3 rounded-2xl bg-muted/50 py-6">
          {/* Mobile */}
          <div className="flex flex-col items-center gap-2 border-r">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "color-mix(in srgb, var(--chart-1) 12%, transparent)",
                color: "var(--chart-1)",
              }}
            >
              <Smartphone className="h-5 w-5" />
            </div>
            <h5 className="text-2xl font-semibold">450</h5>
            <span className="text-md text-muted-foreground">
              Mobile
            </span>
          </div>

          {/* Tablet */}
          <div className="flex flex-col items-center gap-2 border-r">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "color-mix(in srgb, var(--chart-2) 12%, transparent)",
                color: "var(--chart-2)",
              }}
            >
              <Tablet className="h-5 w-5" />
            </div>
            <h5 className="text-2xl font-semibold">300</h5>
            <span className="text-md text-muted-foreground">
              Tablet
            </span>
          </div>

          {/* Laptop */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "color-mix(in srgb, var(--chart-3) 12%, transparent)",
                color: "var(--chart-3)",
              }}
            >
              <Laptop className="h-5 w-5" />
            </div>
            <h5 className="text-2xl font-semibold">250</h5>
            <span className="text-md text-muted-foreground">
              Laptop
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
