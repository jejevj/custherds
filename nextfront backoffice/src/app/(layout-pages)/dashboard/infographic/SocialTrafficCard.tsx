"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  EllipsisVertical,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  Dribbble,
} from "lucide-react"

const socialTraffic = [
  {
    name: "Facebook",
    visits: 46,
    percent: "33%",
    color: "bg-primary",
    icon: Facebook,
  },
  {
    name: "YouTube",
    visits: 12,
    percent: "17%",
    color: "bg-primary/70",
    icon: Youtube,
  },
  {
    name: "LinkedIn",
    visits: 29,
    percent: "21%",
    color: "bg-primary/50",
    icon: Linkedin,
  },
  {
    name: "Twitter",
    visits: 34,
    percent: "23%",
    color: "bg-primary/30",
    icon: Twitter,
  },
  {
    name: "Dribbble",
    visits: 28,
    percent: "19%",
    color: "bg-primary/10",
    icon: Dribbble,
  },
]

export default function SocialTrafficCard() {
  return (
    <Card className="w-full">
      
      {/* Header */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-xl font-medium">
            Social Traffic
          </CardTitle>

          <div className="mt-4 flex items-end gap-3">
            <h2 className="text-3xl font-semibold tracking-tight">
              89,421
            </h2>

            <CardDescription className="pb-0 text-md font-medium">
              Total Visits
            </CardDescription>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <EllipsisVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Report</DropdownMenuItem>
            <DropdownMenuItem>Export Data</DropdownMenuItem>
            <DropdownMenuItem>Refresh</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* Progress */}
        <div className="flex h-3 overflow-hidden rounded-full">
          {socialTraffic.map((item, index) => (
            <div
              key={index}
              className={item.color}
              style={{
                width: item.percent,
              }}
            />
          ))}
        </div>

        {/* List */}
        <div className="space-y-1">
          {socialTraffic.map((item, index) => {
            const Icon = item.icon

            return (
              <div key={index}>
                
                <div className="flex items-center justify-between py-3">
                  
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary-500`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <p className="text-base font-medium">
                      {item.name}
                    </p>
                  </div>

                  {/* Center */}
                  <div className="text-base font-medium">
                    {item.visits} Visits
                  </div>

                  {/* Right */}
                  <div className="w-14 text-right text-base font-medium">
                    {item.percent}
                  </div>
                </div>

                {index !== socialTraffic.length - 1 && (
                  <div className="border-b" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}