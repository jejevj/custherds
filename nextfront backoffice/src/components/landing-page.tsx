"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Map, ShoppingBag } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="bg-muted min-h-svh w-full flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md flex flex-col gap-8">

        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/logo-1.png"
            alt="Custherds"
            width={180}
            height={54}
            className="object-contain"
            priority
          />
        </div>

        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Partner Portal</h1>
          <p className="text-sm text-muted-foreground">
            Sign in as a Guide or Vendor to manage your activities.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Guide Card */}
          <div className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 p-6 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Guide</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your bookings, wallet, and guide profile
              </p>
            </div>
            <Button asChild className="w-full" size="sm">
              <Link href="/guide/login">Sign in as Guide</Link>
            </Button>
          </div>

          {/* Vendor Card */}
          <div className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 p-6 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Vendor</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your bookings, deposit, and store profile
              </p>
            </div>
            <Button asChild className="w-full" size="sm">
              <Link href="/vendor/login">Sign in as Vendor</Link>
            </Button>
          </div>

        </div>

        {/* Admin link — subtle */}
        <p className="text-center text-xs text-muted-foreground">
          Administrator?{" "}
          <Link href="/admin/login" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  )
}
