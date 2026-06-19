import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Bell,
  ShoppingCart,
  Download,
  MessageCircle,
  Settings,
} from "lucide-react"

const glassButton =
  "h-10 w-10 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.20)] hover:bg-white/[0.08]"

const glassBadge =
  "absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full flex items-center justify-center border border-white/10 bg-white/[0.08] backdrop-blur-xl text-xs text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.15)]"

export function IconBadgeButtons() {
  return (
    <div className="flex flex-wrap gap-6">

      <div className="relative">
        <Button size="icon" className={glassButton}>
          <Mail className="h-5 w-5" />
        </Button>
        <Badge className={glassBadge}>9</Badge>
      </div>

      <div className="relative">
        <Button size="icon" className={glassButton}>
          <Bell className="h-5 w-5" />
        </Button>
        <Badge className={glassBadge}>7</Badge>
      </div>

      <div className="relative">
        <Button size="icon" className={glassButton}>
          <Download className="h-5 w-5" />
        </Button>
        <Badge className={glassBadge}>2</Badge>
      </div>

      <div className="relative">
        <Button size="icon" className={glassButton}>
          <ShoppingCart className="h-5 w-5" />
        </Button>
        <Badge className={glassBadge}>5</Badge>
      </div>

      <div className="relative">
        <Button size="icon" className={glassButton}>
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Badge className={glassBadge}>3</Badge>
      </div>

      <div className="relative">
        <Button size="icon" className={glassButton}>
          <Settings className="h-5 w-5" />
        </Button>
        <Badge className={glassBadge}>14</Badge>
      </div>

    </div>
  )
}