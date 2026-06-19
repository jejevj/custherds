import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LucideIcon } from "lucide-react"

interface ProgressStatCardProps {
  title: string
  value: string
  progress: number
  badgeText: string
  icon: LucideIcon
}

export default function ProgressStatCard({
  title,
  value,
  progress,
  badgeText,
  icon: Icon,
}: ProgressStatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-md font-medium text-muted-foreground">
              {title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {value}
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground border border-border">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <Progress
          value={progress}
          className="mb-4 h-1.5 [&>div]:bg-foreground"
        />

        <Badge
          variant="secondary"
          className="bg-muted text-foreground border border-border"
        >
          {badgeText}
        </Badge>
      </CardContent>
    </Card>
  )
}