"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  House, Users, ShoppingBag, Landmark,
  CircleUserRound, LifeBuoyIcon, SendIcon, Map,
} from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import Image from "next/image"

const navMain = [
  { title: "Dashboard",    url: "/admin/dashboard", icon: <House />, isActive: true },
  {
    title: "Internal Users", url: "/admin/users", icon: <Users />,
  },
  {
    title: "Guides", url: "#", icon: <Map />,
    items: [
      { title: "All Guides",       url: "/admin/guides" },
      { title: "Pending Approval", url: "/admin/guides?status=pending" },
      { title: "Approved",         url: "/admin/guides?status=approved" },
      { title: "Rejected",         url: "/admin/guides?status=rejected" },
    ],
  },
  {
    title: "Vendors", url: "#", icon: <ShoppingBag />,
    items: [
      { title: "All Vendors",      url: "/admin/vendors" },
      { title: "Pending Approval", url: "/admin/vendors?status=pending" },
      { title: "Approved",         url: "/admin/vendors?status=approved" },
      { title: "Rejected",         url: "/admin/vendors?status=rejected" },
    ],
  },
  {
    title: "Finance", url: "#", icon: <Landmark />,
    items: [
      { title: "Transactions", url: "/admin/finance/transactions" },
      { title: "Withdrawals",  url: "/admin/finance/withdrawals" },
      { title: "Commission",   url: "/admin/finance/commission" },
    ],
  },
  { title: "Profile", url: "/admin/profile", icon: <CircleUserRound /> },
]

const navSecondary = [
  { title: "Support",  url: "#", icon: <LifeBuoyIcon /> },
  { title: "Feedback", url: "#", icon: <SendIcon /> },
]

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onHoverChange?: (value: boolean) => void
}

export function AdminSidebar({ onHoverChange, ...props }: AdminSidebarProps) {
  return (
    <div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <Sidebar collapsible="icon" {...props} className="shadow-lg">
        <SidebarHeader className="h-16 justify-center px-3 border-b">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="p-2">
                <a href="/admin/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center mx-auto rounded-lg overflow-hidden bg-sidebar-primary">
                    <Image src="/logo-4.png" alt="Custherds" width={32} height={32} className="object-contain" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <Image src="/logo-1.png" alt="Custherds" width={110} height={28} className="object-contain" />
                    <span className="truncate text-xs text-muted-foreground">Admin Portal</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex min-h-full flex-col">
              <NavMain items={navMain} />
              <NavSecondary items={navSecondary} className="mt-auto px-3" />
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="border-t justify-center px-3">
          <NavUser user={{ name: "", email: "", avatar: "" }} />
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
