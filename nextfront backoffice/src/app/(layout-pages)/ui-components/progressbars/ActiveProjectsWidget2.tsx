"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MoreVertical } from "lucide-react"

const projects = [
  {
    name: "Laravel",
    subtitle: "eCommerce",
    progress: 65,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
  },
  {
    name: "Figma",
    subtitle: "App UI Kit",
    progress: 86,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  },
  {
    name: "VueJs",
    subtitle: "Calendar App",
    progress: 90,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  },
  {
    name: "React",
    subtitle: "Dashboard",
    progress: 37,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    name: "Bootstrap",
    subtitle: "Website",
    progress: 22,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
  },
  {
    name: "Sketch",
    subtitle: "Website Design",
    progress: 29,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sketch/sketch-original.svg",
  },
]

export function ActiveProjectsWidget2() {
  return (
    <Card>
      <CardContent className="p-6">

        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Active Project</h3>
            <p className="text-sm text-muted-foreground">
              Average 72% Completed
            </p>
          </div>

          <MoreVertical className="h-5 w-5 text-muted-foreground cursor-pointer" />
        </div>

        <div className="mt-6 space-y-6">
          {projects.map((project, index) => (
            <div key={index} className="space-y-2">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center
                                   border border-border">
                    <img
                      src={project.icon}
                      alt={project.name}
                      className="h-6 w-6 filter grayscale"
                    />
                  </div>

                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.subtitle}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-medium text-muted-foreground">
                  {project.progress}%
                </span>
              </div>

              {/* Working Gradient Progress */}
              <Progress
                value={project.progress}
                className={`h-1.5 bg-muted`}
              />

            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  )
}
