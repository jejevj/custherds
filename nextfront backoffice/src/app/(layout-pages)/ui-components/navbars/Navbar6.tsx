"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Menu } from "lucide-react"

export function Navbar6() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <nav className="rounded-2xl px-6 py-4  bg-muted shadow-lg border border-border">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <h2 className="text-lg font-bold">
            MyAdmin
          </h2>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center gap-8">

            {/* Left Links */}
            <div className="flex items-center gap-6">

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  Products <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl shadow-xl border border-border">
                  <DropdownMenuItem>
                    Product 1
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Product 2
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  Use case <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white rounded-xl shadow-xl border border-emerald-100">
                  <DropdownMenuItem className="hover:bg-emerald-50">
                    Use Case 1
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-emerald-50">
                    Use Case 2
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  Integration <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white rounded-xl shadow-xl border border-pink-100">
                  <DropdownMenuItem className="hover:bg-pink-50">
                    Integration 1
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-pink-50">
                    Integration 2
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 font-medium">
                  Resources <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white rounded-xl shadow-xl border border-orange-100">
                  <DropdownMenuItem className="hover:bg-orange-50">
                    Blog
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-orange-50">
                    Docs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <a
                href="#"
                className="text-sm font-medium"
              >
                Pricing
              </a>

            </div>

            {/* Right Links */}
            <div className="flex items-center gap-3">

              <a
                href="#"
                className="text-sm font-semibold"
              >
                Login
              </a>

              <Button
                variant="outline"
                className="rounded-lg"
              >
                Request demo
              </Button>

              <Button className="rounded-lg shadow-md">
                Get started
              </Button>

            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="xl:hidden text-indigo-600"
            onClick={() => setOpen(!open)}
          >
            <Menu className="h-6 w-6" />
          </button>

        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="mt-4 flex flex-col gap-4 xl:hidden border-t border-indigo-200 pt-4">

            <a href="#" className="text-indigo-600 font-medium">
              Products
            </a>

            <a href="#" className="text-emerald-600 font-medium">
              Use case
            </a>

            <a href="#" className="text-blue-600 font-medium">
              Pricing
            </a>

            <div className="flex flex-col gap-3 pt-3 border-t border-indigo-200">
              <a href="#" className="text-purple-600 font-semibold">
                Login
              </a>

              <Button
                variant="outline"
                className="rounded-lg w-full border-indigo-300 text-indigo-600"
              >
                Request demo
              </Button>

              <Button className="rounded-lg w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                Get started
              </Button>
            </div>

          </div>
        )}

      </nav>
    </div>
  )
}
