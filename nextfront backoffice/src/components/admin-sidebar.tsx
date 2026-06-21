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
  Users,
  ShoppingBag,
  Map,
  Star,
  BarChart2,
  Settings,
  CircleUserRound,
  LifeBuoyIcon,
  SendIcon,
  ShieldCheck,
  Landmark,
  Bell,
  FileText,
  LayoutGrid,
  Megaphone,
} from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import Image from "next/image"

const data = {
  user: {
    name: "Admin User",
    email: "admin@custherds.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: <House />,
      isActive: true,
    },
    {
      title: "User Management",
      url: "#",
      icon: <Users />,
      items: [
        { title: "All Users", url: "/admin/users" },
        { title: "Vendors", url: "/admin/users/vendors" },
        { title: "Guides", url: "/admin/users/guides" },
        { title: "Tourists", url: "/admin/users/tourists" },
      ],
    },
    {
      title: "Vendor Management",
      url: "#",
      icon: <ShoppingBag />,
      items: [
        { title: "All Vendors", url: "/admin/vendors" },
        { title: "Pending Approval", url: "/admin/vendors/pending" },
        { title: "Products", url: "/admin/vendors/products" },
      ],
    },
    {
      title: "Guide Management",
      url: "#",
      icon: <Map />,
      items: [
        { title: "All Guides", url: "/admin/guides" },
        { title: "Pending Approval", url: "/admin/guides/pending" },
        { title: "Tour Packages", url: "/admin/guides/packages" },
      ],
    },
    {
      title: "Destinations",
      url: "#",
      icon: <LayoutGrid />,
      items: [
        { title: "All Destinations", url: "/admin/destinations" },
        { title: "Add Destination", url: "/admin/destinations/add" },
        { title: "Categories", url: "/admin/destinations/categories" },
      ],
    },
    {
      title: "Reviews & Ratings",
      url: "/admin/reviews",
      icon: <Star />,
    },
    {
      title: "Promotions",
      url: "#",
      icon: <Megaphone />,
      items: [
        { title: "All Promotions", url: "/admin/promotions" },
        { title: "Create Promotion", url: "/admin/promotions/create" },
      ],
    },
    {
      title: "Finance",
      url: "#",
      icon: <Landmark />,
      items: [
        { title: "Overview", url: "/admin/finance" },
        { title: "Transactions", url: "/admin/finance/transactions" },
        { title: "Withdrawals", url: "/admin/finance/withdrawals" },
        { title: "Commission", url: "/admin/finance/commission" },
      ],
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: <BarChart2 />,
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: <Bell />,
    },
    {
      title: "Content Management",
      url: "#",
      icon: <FileText />,
      items: [
        { title: "Pages", url: "/admin/content/pages" },
        { title: "Blog", url: "/admin/content/blog" },
        { title: "Banners", url: "/admin/content/banners" },
      ],
    },
    {
      title: "Roles & Permissions",
      url: "/admin/roles",
      icon: <ShieldCheck />,
    },
    {
      title: "Admin Profile",
      url: "/admin/profile",
      icon: <CircleUserRound />,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: <Settings />,
    },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: <LifeBuoyIcon /> },
    { title: "Feedback", url: "#", icon: <SendIcon /> },
  ],
}

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
