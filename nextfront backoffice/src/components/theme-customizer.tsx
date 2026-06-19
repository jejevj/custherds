"use client"

import { useUIThemeStore } from "@/store/ui-theme.store"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Settings } from "lucide-react"

export default function ThemeCustomizer() {
  const { setTheme: setMode } = useTheme()        // next-themes
  const { theme, setTheme } = useUIThemeStore()   // custom themes

  const themes = [
    {
      id: "gaussian-blue",
      label: "Gaussian Blue",
      preview: "bg-gradient-to-r from-blue-300 to-blue-900",
    },
    {
      id: "gaussian-black",
      label: "Gaussian Black",
      preview: "bg-gradient-to-r from-gray-300 to-gray-900",
    },
    {
      id: "gaussian-amethyst",
      label: "Gaussian Amethyst",
      preview: "bg-gradient-to-r from-purple-300 to-purple-900",
    },
    {
      id: "gaussian-emerald",
      label: "Gaussian Emerald",
      preview: "bg-gradient-to-r from-green-300 to-green-900",
    },
    {
      id: "gaussian-bronze",
      label: "Gaussian Bronze",
      preview: "bg-gradient-to-r from-red-300 to-red-900",
    },
    {
      id: "gaussian-gold",
      label: "Gaussian Gold",
      preview: "bg-gradient-to-r from-yellow-300 to-yellow-900",
    },
  ]

  return (
    <Sheet>
      {/* Trigger */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="
                  rounded-full h-10 w-10 fixed bottom-4 right-4 z-50 
                  shadow-lg cursor-pointer 
                  hover:bg-primary/90 transition
                "
              >
                <Settings className="size-5 animate-spin" />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>

          <TooltipContent side="left">
            Theme Customizer
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Panel */}
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>
            Theme Customizer
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setTheme(t.id)   // apply custom theme
              }}
              className={`relative h-16 rounded-lg cursor-pointer transition hover:scale-105 overflow-hidden
                  ${theme === t.id ? "ring-2 ring-blue-500 scale-105" : ""}
                  ${t.preview}
                `}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20" />

              {/* Theme Name */}
              <span className="absolute bottom-1 left-2 text-[11px] font-medium text-white bg-black/40 px-2 py-0.5 rounded">
                {t.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              setTheme("")
              setMode("system")
            }}
            className="w-full py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            Reset Theme
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}