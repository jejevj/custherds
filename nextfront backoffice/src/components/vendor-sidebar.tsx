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
  ShoppingBag,
  ClipboardList,
  Star,
  BarChart2,
  Settings,
  CircleUserRound,
  LifeBuoyIcon,
  SendIcon,
  Megaphone,
  PackageSearch,
  WalletCards,
} from "lucide-react"
import { ScrollArea } from "./ui/scroll-area"
import Image from "next/image"

const data = {
  user: {
    name: "Vendor User",
    email: "vendor@custherds.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/vendor/dashboard",
      icon: <House />,
      isActive: true,
    },
    {
      title: "Produk & Layanan",
      url: "#",
      icon: <ShoppingBag />,
      items: [
        { title: "Daftar Produk", url: "/vendor/products" },
        { title: "Tambah Produk", url: "/vendor/products/add" },
        { title: "Kategori Produk", url: "/vendor/products/categories" },
        { title: "Stok & Inventori", url: "/vendor/products/inventory" },
      ],
    },
    {
      title: "Pemesanan",
      url: "#",
      icon: <ClipboardList />,
      items: [
        { title: "Semua Pesanan", url: "/vendor/orders" },
        { title: "Pesanan Baru", url: "/vendor/orders/new" },
        { title: "Riwayat Pesanan", url: "/vendor/orders/history" },
      ],
    },
    {
      title: "Pencarian Wisatawan",
      url: "/vendor/customers",
      icon: <PackageSearch />,
    },
    {
      title: "Ulasan & Rating",
      url: "/vendor/reviews",
      icon: <Star />,
    },
    {
      title: "Promosi",
      url: "#",
      icon: <Megaphone />,
      items: [
        { title: "Daftar Promo", url: "/vendor/promotions" },
        { title: "Buat Promo", url: "/vendor/promotions/create" },
      ],
    },
    {
      title: "Keuangan",
      url: "#",
      icon: <WalletCards />,
      items: [
        { title: "Pendapatan", url: "/vendor/finance/revenue" },
        { title: "Penarikan Dana", url: "/vendor/finance/withdrawal" },
        { title: "Riwayat Transaksi", url: "/vendor/finance/transactions" },
      ],
    },
    {
      title: "Laporan",
      url: "/vendor/reports",
      icon: <BarChart2 />,
    },
    {
      title: "Profil Toko",
      url: "/vendor/profile",
      icon: <CircleUserRound />,
    },
    {
      title: "Pengaturan",
      url: "/vendor/settings",
      icon: <Settings />,
    },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: <LifeBuoyIcon /> },
    { title: "Feedback", url: "#", icon: <SendIcon /> },
  ],
}

type VendorSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onHoverChange?: (value: boolean) => void
}

export function VendorSidebar({ onHoverChange, ...props }: VendorSidebarProps) {
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
                <a href="/vendor/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center mx-auto rounded-lg overflow-hidden bg-sidebar-primary">
                    <Image src="/logo-4.png" alt="Custherds" width={32} height={32} className="object-contain" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <Image src="/logo-1.png" alt="Custherds" width={110} height={28} className="object-contain" />
                    <span className="truncate text-xs text-muted-foreground">Vendor Portal</span>
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
