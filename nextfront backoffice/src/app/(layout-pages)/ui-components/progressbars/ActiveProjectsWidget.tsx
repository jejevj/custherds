"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  MoreVertical,
  Box,
  Figma,
  Atom,
  Layers,
  Palette,
} from "lucide-react"

const projects = [
  {
    name: "Laravel",
    subtitle: "eCommerce",
    progress: 65,
    color: "bg-primary/10",
    icon: Box,
    iconBg: "bg-primary/10",
    iconColor: "text-primary-500",
  },
  {
    name: "Figma",
    subtitle: "App UI Kit",
    progress: 86,
    color: "bg-primary/10",
    icon: Figma,
    iconBg: "bg-primary/10",
    iconColor: "text-primary-500",
  },
  {
    name: "VueJs",
    subtitle: "Calendar App",
    progress: 90,
    color: "bg-primary/10",
    icon: Layers,
    iconBg: "bg-primary/10",
    iconColor: "text-primary-500",
  },
  {
    name: "React",
    subtitle: "Dashboard",
    progress: 37,
    color: "bg-primary/10",
    icon: Atom,
    iconBg: "bg-primary/10",
    iconColor: "text-primary-500",
  },
  {
    name: "Bootstrap",
    subtitle: "Website",
    progress: 22,
    color: "bg-primary/10",
    icon: Box,
    iconBg: "bg-primary/10",
    iconColor: "text-primary-500",
  },
  {
    name: "Sketch",
    subtitle: "Website Design",
    progress: 29,
    color: "bg-primary/10",
    icon: Palette,
    iconBg: "bg-primary/10",
    iconColor: "text-primary-500",
  },
]

export function ActiveProjectsWidget() {
  return (
    <Card>
      <CardContent className="p-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Active Project</h3>
            <p className="text-sm text-muted-foreground">
              Average 72% Completed
            </p>
          </div>

          <MoreVertical className="h-5 w-5 text-muted-foreground cursor-pointer" />
        </div>

        {/* Projects List */}
        <div className="mt-6 space-y-6">
          {projects.map((project, index) => {
            const Icon = project.icon

            return (
              <div key={index} className="space-y-2">

                {/* Top Row */}
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">
                    {/* Mini Logo */}
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${project.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${project.iconColor}`} />
                    </div>

                    {/* Name + Subtitle */}
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Percentage */}
                  <span className="text-sm font-medium text-muted-foreground">
                    {project.progress}%
                  </span>
                </div>

                {/* Progress */}
                <Progress
                  value={project.progress}
                  className={`h-1.5 bg-muted mt-3 [&>div]:${project.color}`}
                />
              </div>
            )
          })}
        </div>

      </CardContent>
    </Card>
  )
}
