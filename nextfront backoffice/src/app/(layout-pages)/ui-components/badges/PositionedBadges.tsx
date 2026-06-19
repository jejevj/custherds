import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const glassButton =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.20)] hover:bg-white/[0.08]"

const glassBadge =
  "absolute -top-2 -right-3 border border-white/10 bg-white/[0.08] backdrop-blur-xl text-foreground px-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"

export function PositionedBadges() {
  return (
    <div className="flex flex-wrap gap-6">

      <div className="relative">
        <Button className={glassButton}>
          Inbox
        </Button>
        <Badge className={glassBadge}>
          99+
        </Badge>
      </div>

      <div className="relative">
        <Button className={glassButton}>
          Alerts
        </Button>
        <Badge className={glassBadge}>
          7
        </Badge>
      </div>

      <div className="relative">
        <Button className={glassButton}>
          Downloads
        </Button>
        <Badge className={glassBadge}>
          2
        </Badge>
      </div>

      <div className="relative">
        <Button className={glassButton}>
          Updates
        </Button>
        <Badge className={glassBadge}>
          14
        </Badge>
      </div>

      <div className="relative">
        <Button className={glassButton}>
          Cart
        </Button>
        <Badge className={glassBadge}>
          5
        </Badge>
      </div>

      <div className="relative">
        <Button className={glassButton}>
          Messages
        </Button>
        <Badge className={glassBadge}>
          3
        </Badge>
      </div>

    </div>
  )
}