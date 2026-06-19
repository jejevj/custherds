"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SonnerPosition() {
  return (
    <div className="flex flex-wrap justify-center gap-4 border p-6 rounded-xl shadow-sm max-w-xl">
      <Button
        className="bg-card/30
          border-border
          backdrop-blur-xl text-primary-500 hover:bg-card/50 px-5"
        onClick={() =>
          toast("Event has been created", { position: "top-left" })
        }
      >
        Top Left
      </Button>
      <Button
        className="bg-card/30
          border-border
          backdrop-blur-xl text-primary-500 hover:bg-card/50 px-5"
        onClick={() =>
          toast("Event has been created", { position: "top-center" })
        }
      >
        Top Center
      </Button>
      <Button
        className="bg-card/30
          border-border
          backdrop-blur-xl text-primary-500 hover:bg-card/50 px-5"
        onClick={() =>
          toast("Event has been created", { position: "top-right" })
        }
      >
        Top Right
      </Button>
      <Button
        className="bg-card/30
          border-border
          backdrop-blur-xl text-primary-500 hover:bg-card/50 px-5"
        onClick={() =>
          toast("Event has been created", { position: "bottom-left" })
        }
      >
        Bottom Left
      </Button>
      <Button
        className="bg-card/30
          border-border
          backdrop-blur-xl text-primary-500 hover:bg-card/50 px-5"
          onClick={() =>
          toast("Event has been created", { position: "bottom-center" })
        }
      >
        Bottom Center
      </Button>
      <Button
        className="bg-card/30
          border-border
          backdrop-blur-xl text-primary-500 hover:bg-card/50 px-5"
          onClick={() =>
          toast("Event has been created", { position: "bottom-right" })
        }
      >
        Bottom Right
      </Button>
    </div>
  )
}
