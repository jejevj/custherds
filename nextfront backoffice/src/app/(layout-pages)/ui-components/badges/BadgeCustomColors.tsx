import { Badge } from "@/components/ui/badge"

export function BadgeCustomColors() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="outline"
        className="border-blue-500/20 bg-blue-500/10 text-blue-400 backdrop-blur-xl"
      >
        Blue
      </Badge>

      <Badge
        variant="outline"
        className="border-green-500/20 bg-green-500/10 text-green-400 backdrop-blur-xl"
      >
        Green
      </Badge>

      <Badge
        variant="outline"
        className="border-sky-500/20 bg-sky-500/10 text-sky-400 backdrop-blur-xl"
      >
        Sky
      </Badge>

      <Badge
        variant="outline"
        className="border-purple-500/20 bg-purple-500/10 text-purple-400 backdrop-blur-xl"
      >
        Purple
      </Badge>

      <Badge
        variant="outline"
        className="border-red-500/20 bg-red-500/10 text-red-400 backdrop-blur-xl"
      >
        Red
      </Badge>

      <Badge
        variant="outline"
        className="border-orange-500/20 bg-orange-500/10 text-orange-400 backdrop-blur-xl"
      >
        Orange
      </Badge>
    </div>
  )
}