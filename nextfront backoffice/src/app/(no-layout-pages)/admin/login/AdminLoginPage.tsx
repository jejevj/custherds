"use client"

import Image from "next/image"
import { LoginForm } from "@/components/login-form"

export default function AdminLoginPage() {
  return (
    <div className="bg-muted min-h-svh w-full flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center">
            <Image
              src="/logo-1.png"
              alt="Custherds"
              width={160}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <LoginForm
            role="admin"
            registerHref="#"
          />
        </div>
      </div>
    </div>
  )
}
