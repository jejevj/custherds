"use client"

import * as React from "react"
import {
  BookOpen,
  CalendarDays,
  CircleUserRound,
  Compass,
  LayoutDashboard,
  MapPinned,
  Menu,
  Settings,
  WalletCards,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { UserDropdown } from "@/components/UserDropdown"
import Footer from "@/components/layout/Footer"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const navigation = [
  { title: "Dashboard", url: "/guide", icon: LayoutDashboard },
  { title: "Pesanan", url: "/guide/bookings", icon: CalendarDays },
  { title: "Destinasi", url: "/guide/destinations", icon: MapPinned },
  { title: "Paket", url: "/guide/packages", icon: Compass },
  { title: "Dompet", url: "/guide/wallet", icon: WalletCards },
  { title: "Profil", url: "/guide/profile", icon: CircleUserRound },
  { title: "Pengaturan", url: "/guide/settings", icon: Settings },
]

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar items={navigation} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <Menu className="h-5 w-5 text-muted-foreground md:hidden" />
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">Portal Pemandu</span>
            </div>
          </div>
          <UserDropdown />
        </header>
        <main className="flex-1">{children}</main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
