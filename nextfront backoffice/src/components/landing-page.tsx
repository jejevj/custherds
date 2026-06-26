"use client"

import Image from "next/image"
import Link from "next/link"
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
            Masuk sebagai Guide atau Vendor untuk mengelola aktivitas Anda.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Guide Card */}
          <Link
            href="/guide/login"
            className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 p-6 flex flex-col items-center gap-3 text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Map className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Guide</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kelola booking, wallet, dan profil guide kamu
              </p>
            </div>
            <span className="mt-1 text-xs font-medium text-primary group-hover:underline">
              Login sebagai Guide →
            </span>
          </Link>

          {/* Vendor Card */}
          <Link
            href="/vendor/login"
            className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 p-6 flex flex-col items-center gap-3 text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Vendor</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kelola booking, deposit, dan profil toko kamu
              </p>
            </div>
            <span className="mt-1 text-xs font-medium text-primary group-hover:underline">
              Login sebagai Vendor →
            </span>
          </Link>

        </div>

        {/* Admin link — subtle */}
        <p className="text-center text-xs text-muted-foreground">
          Administrator?{" "}
          <Link href="/admin/login" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Login di sini
          </Link>
        </p>

      </div>
    </div>
  )
}
