"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Settings, LogOut } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { USER_TYPE_LABEL } from "@/lib/constants"

interface UserDropdownProps {
  loginPath?: string
}

export function UserDropdown({ loginPath = "/admin/login" }: UserDropdownProps) {
  const user   = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const initials = user?.user_name
    ? user.user_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  const roleLabel = user ? (USER_TYPE_LABEL[user.user_type] ?? "User") : "User"

  const handleLogout = () => {
    logout()
    window.location.href = loginPath
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full h-10 w-10 p-0 overflow-hidden ml-2"
        >
          <Avatar className="h-10 w-10 border-border rounded-full">
            <AvatarFallback className="font-semibold text-sm">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-3 rounded-xl shadow-xl">
        <DropdownMenuLabel className="border-border rounded-xl border mb-3 bg-muted/50">
          <div className="flex items-center gap-3 p-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.user_name ?? "-"}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuItem className="gap-2 h-9">
          <User className="!size-5" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2 h-9">
          <Settings className="!size-5" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <div className="mt-1">
          <Button
            variant="default"
            className="w-full h-8 justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
