"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const glassButton =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.20)] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200";   

export function SocialButtonsCard() {
  return (
    <Card>
       <CardHeader className="border-b py-4">
                <CardTitle className="text-xl">Social Buttons</CardTitle>
            </CardHeader>

      <CardContent className="space-y-6 p-6">

        {/* ================= FULL COLOR BUTTONS ================= */}
        <div className="flex flex-wrap gap-3">

          <Button className={glassButton}>
            <i className="bi bi-facebook text-lg"></i>
            Facebook
          </Button>

          <Button className={glassButton}>
            <i className="bi bi-twitter-x text-lg"></i>
            Twitter
          </Button>

          <Button className={glassButton}>
            <i className="bi bi-youtube text-lg"></i>
            YouTube
          </Button>

          <Button className={glassButton}>
            <i className="bi bi-instagram text-lg"></i>
            Instagram
          </Button>

          <Button className={glassButton}>
            <i className="bi bi-linkedin text-lg"></i>
            LinkedIn
          </Button>

          <Button className={glassButton}>
            <i className="bi bi-apple text-lg"></i>
            Apple
          </Button>

          <Button className={glassButton}>
            <i className="bi bi-pinterest text-lg"></i>
            Pinterest
          </Button>

        </div>

        {/* ================= ICON SQUARE ================= */}
        <div className="flex flex-wrap gap-3">

          <Button size="icon" className={glassButton}>
            <i className="bi bi-facebook text-lg"></i>
          </Button>

          <Button size="icon" className={glassButton}>
            <i className="bi bi-linkedin text-lg"></i>
          </Button>

          <Button size="icon" className={glassButton}>
            <i className="bi bi-youtube text-lg"></i>
          </Button>

          <Button size="icon" className={glassButton}>
            <i className="bi bi-twitter-x text-lg"></i>
          </Button>

        </div>

        {/* ================= ICON ROUNDED ================= */}
        <div className="flex flex-wrap gap-3">

          <Button className={`${glassButton} rounded-full w-10 h-10`}>
            <i className="bi bi-facebook text-lg"></i>
          </Button>

          <Button className={`${glassButton} rounded-full w-10 h-10`}>
            <i className="bi bi-linkedin text-lg"></i>
          </Button>

          <Button className={`${glassButton} rounded-full w-10 h-10`}>
            <i className="bi bi-instagram text-lg"></i>
          </Button>

          <Button className={`${glassButton} rounded-full w-10 h-10`}>
            <i className="bi bi-youtube text-lg"></i>
          </Button>

        </div>

      </CardContent>
    </Card>
  )
}
