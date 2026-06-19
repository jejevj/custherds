import { Badge } from "@/components/ui/badge"
import {
  BadgeCheck,
  BookmarkIcon,
  AlertTriangle,
  Info,
  XCircle,
  Star,
  ShieldCheck,
} from "lucide-react"

const glassBadge =
  "gap-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:bg-white/[0.06] transition-colors"

export function BadgeWithIconLeft() {
  return (
    <div className="flex flex-wrap gap-3">
      <Badge className={glassBadge}>
        <BadgeCheck className="h-4 w-4" />
        <span>Verified</span>
      </Badge>

      <Badge className={glassBadge}>
        <span>Bookmark</span>
        <BookmarkIcon className="h-4 w-4" />
      </Badge>

      <Badge className={glassBadge}>
        <Info className="h-4 w-4" />
        <span>Info</span>
      </Badge>

      <Badge className={glassBadge}>
        <Star className="h-4 w-4" />
        <span>Featured</span>
      </Badge>

      <Badge className={glassBadge}>
        <XCircle className="h-4 w-4" />
        <span>Blocked</span>
      </Badge>

      <Badge className={glassBadge}>
        <span>Warning</span>
        <AlertTriangle className="h-4 w-4" />
      </Badge>

      <Badge className={glassBadge}>
        <ShieldCheck className="h-4 w-4" />
        <span>Protected</span>
      </Badge>
    </div>
  )
}