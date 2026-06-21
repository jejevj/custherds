"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  House,
  CalendarDays,
  Map,
  Users,
  Star,
  BarChart2,
  CircleUserRound,
  LifeBuoyIcon,
  SendIcon,
  PieChart,
  MessageSquare,
  WalletCards,
  Route,
  Settings,
} from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"

const data = {
  user: {
    name: "Guide User",
    email: "guide@custherds.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/guide/dashboard",
      icon: <House />,
      isActive: true,
    },
    {
      title: "Jadwal Tur",
      url: "#",
      icon: <CalendarDays />,
      items: [
        { title: "Jadwal Hari Ini", url: "/guide/schedule/today" },
        { title: "Semua Jadwal", url: "/guide/schedule" },
        { title: "Tambah Jadwal", url: "/guide/schedule/add" },
      ],
    },
    {
      title: "Paket Tur",
      url: "#",
      icon: <Route />,
      items: [
        { title: "Daftar Paket", url: "/guide/packages" },
        { title: "Buat Paket", url: "/guide/packages/create" },
        { title: "Rute Wisata", url: "/guide/packages/routes" },
      ],
    },
    {
      title: "Destinasi",
      url: "/guide/destinations",
      icon: <Map />,
    },
    {
      title: "Wisatawan",
      url: "#",
      icon: <Users />,
      items: [
        { title: "Daftar Wisatawan", url: "/guide/tourists" },
        { title: "Permintaan Pemandu", url: "/guide/tourists/requests" },
      ],
    },
    {
      title: "Pesan & Chat",
      url: "/guide/messages",
      icon: <MessageSquare />,
    },
    {
      title: "Ulasan & Rating",
      url: "/guide/reviews",
      icon: <Star />,
    },
    {
      title: "Keuangan",
      url: "#",
      icon: <WalletCards />,
      items: [
        { title: "Pendapatan", url: "/guide/finance/revenue" },
        { title: "Penarikan Dana", url: "/guide/finance/withdrawal" },
        { title: "Riwayat Transaksi", url: "/guide/finance/transactions" },
      ],
    },
    {
      title: "Laporan",
      url: "/guide/reports",
      icon: <BarChart2 />,
    },
    {
      title: "Profil Pemandu",
      url: "/guide/profile",
      icon: <CircleUserRound />,
    },
    {
      title: "Pengaturan",
      url: "/guide/settings",
      icon: <Settings />,
    },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: <LifeBuoyIcon /> },
    { title: "Feedback", url: "#", icon: <SendIcon /> },
  ],
}

type GuideSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onHoverChange?: (value: boolean) => void
}

export function GuideSidebar({ onHoverChange, ...props }: GuideSidebarProps) {
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
                <a href="/guide/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center mx-auto rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <PieChart className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Custherds</span>
                    <span className="truncate text-xs">Guide Portal</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex min-h-full flex-col">
              <NavMain items={data.navMain} />
              <NavSecondary items={data.navSecondary} className="mt-auto px-3" />
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="border-t justify-center px-3">
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
