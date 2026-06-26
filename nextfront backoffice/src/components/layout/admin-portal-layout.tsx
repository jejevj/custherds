"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch } from "@/components/global-search"
import { UserDropdown } from "@/components/UserDropdown"
import Footer from "@/components/layout/Footer"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(true)
  const [hovered, setHovered] = useState(false)

  const isExpanded = open || hovered

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => setOpen(window.innerWidth >= 1024)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <SidebarProvider open={isExpanded} onOpenChange={setOpen}>
      <AdminSidebar onHoverChange={setHovered} />
      <SidebarInset>
        <header
          className={cn(
            "px-6 sticky top-0 z-40 flex h-16 w-full shrink-0 items-center gap-2 transition-all duration-200 border-b",
            scrolled
              ? "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md"
              : "bg-transparent"
          )}
        >
          <div className="flex items-center gap-1">
            <SidebarTrigger className="-ml-1 rounded-full h-10 w-10 [&_svg]:!size-5 hover:bg-muted/60 transition-colors" />
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-1">
              <GlobalSearch />
              <ThemeToggle />
              <div className="relative hidden md:inline-flex">
                <NotificationDropdown />
              </div>
              <UserDropdown loginPath="/admin/login" />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col p-6">{children}</div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  )
}
