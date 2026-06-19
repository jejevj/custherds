"use client"

import { Airplay } from "lucide-react"
import {
  FolderKanban,
  FileText,
  Users,
  MessageCircle,
  ShoppingCart,
  CreditCard,
  Briefcase,
  Inbox,
  File,
  Calendar,
  Cloud,
  Store,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type AppItem = {
  icon: LucideIcon
  label: string
}

const appItems: AppItem[] = [
  { icon: FolderKanban, label: "Projects" },
  { icon: FileText, label: "Invoice" },
  { icon: Users, label: "Teams" },
  { icon: MessageCircle, label: "Chat" },
  { icon: ShoppingCart, label: "Billing" },
  { icon: CreditCard, label: "Payment" },
  { icon: Briefcase, label: "Management" },
  { icon: Inbox, label: "Inbox" },
  { icon: File, label: "Docs" },
  { icon: Calendar, label: "Events" },
  { icon: Cloud, label: "Cloud" },
  { icon: Store, label: "Store" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
]

export function AppLauncherDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10"
        >
          <Airplay className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[300px] p-0 rounded-xl overflow-hidden shadow-xl"
      >
        <ScrollArea className="h-[420px]">
          <div className="grid grid-cols-2">
            {appItems.map((item, index) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4",
                    "border-border border-b border-r",
                    "hover:bg-muted/50 transition-all duration-200 cursor-pointer",
                    (index + 1) % 2 === 0 && "border-r-0"
                  )}
                >
                  <div
                    className={cn(
                      "h-12 w-12 flex items-center justify-center rounded-full bg-white/10 border border-border",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-medium text-center">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}