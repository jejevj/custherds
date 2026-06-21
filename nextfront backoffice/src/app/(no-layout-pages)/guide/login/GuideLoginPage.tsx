"use client"

import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export default function GuideLoginPage() {
  return (
    <div className="bg-muted min-h-svh w-full flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="text-lg">Custherds</span>
          </div>
          <LoginForm
            role="guide"
            loginEndpoint="https://www.custherds.com/guide/login/doLogin"
            registerHref="https://custherds.ourtestcloud.my.id/register"
          />
        </div>
      </div>
    </div>
  )
}
