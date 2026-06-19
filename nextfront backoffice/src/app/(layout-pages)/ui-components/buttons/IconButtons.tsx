import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Home,
  XCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Sparkles,
  Flame,
  Heart,
  Sun,
  Layers,
  Type,
} from "lucide-react"

const glassButton =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.20)] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200";

export function IconButtons() {
  return (
    <Card>
  <CardHeader className="border-b py-4">
    <CardTitle className="text-xl">Icon Buttons</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6 p-6">

    {/* Default Buttons */}
    <div>
      <p className="mb-3 text-lg font-medium text-muted-foreground">
        Default
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <Button className="px-6 gap-2">
          <Home className="h-4 w-4" />
          Launch
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <XCircle className="h-4 w-4" />
          Fix
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <CheckCircle className="h-4 w-4" />
          Ship
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Info className="h-4 w-4" />
          Audit
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <AlertTriangle className="h-4 w-4" />
          Alert
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Sparkles className="h-4 w-4" />
          Design
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Flame className="h-4 w-4" />
          Deploy
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Heart className="h-4 w-4" />
          Sync
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Sun className="h-4 w-4" />
          Build
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Layers className="h-4 w-4" />
          Plan
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Type className="h-4 w-4" />
          Code
        </Button>
      </div>
    </div>

    {/* Rounded Buttons */}
    <div>
      <p className="mb-3 text-lg font-medium text-muted-foreground">
        Rounded
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <Button className={`${glassButton} px-6 gap-2`}>
          <Home className="h-4 w-4" />
          Compile
        </Button>

        <Button className={`${glassButton} px-6 rounded-full gap-2`}>
          <XCircle className="h-4 w-4" />
          Debug
        </Button>

        <Button className={`${glassButton} px-6 rounded-full gap-2`}>
          <CheckCircle className="h-4 w-4" />
          Test
        </Button>

        <Button className={`${glassButton} px-6 rounded-full gap-2`}>
          <Info className="h-4 w-4" />
          Review
        </Button>

        <Button className={`${glassButton} px-6 rounded-full gap-2`}>
          <AlertTriangle className="h-4 w-4" />
          Monitor
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Sparkles className="h-4 w-4" />
          Scale
        </Button>

        <Button className={`${glassButton} px-6 gap-2`}>
          <Flame className="h-4 w-4" />
          Release
        </Button>

        <Button className={`${glassButton} px-6 rounded-full gap-2`}>
          <Heart className="h-4 w-4" />
          Maintain
        </Button>

        <Button className={`${glassButton} px-6 rounded-full gap-2`}>
          <Sun className="h-4 w-4" />
          Optimize
        </Button>

        <Button className={`${glassButton} px-6 rounded-full gap-2`}>
          <Type className="h-4 w-4" />
          Merge
        </Button>
      </div>
    </div>

    <div className="space-y-8">

  {/* Default Icon Buttons */}
  <div>
    <p className="mb-3 text-lg font-medium text-muted-foreground">
      Without Text
    </p>

    <div className="flex items-center gap-4 flex-wrap">

      <Button className={`${glassButton}`}>
        <Home className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`}>
        <XCircle className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`}>
        <CheckCircle className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`}>
        <Info className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`}>
        <AlertTriangle className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`}>
        <Sparkles className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`}>
        <Flame className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`}>
        <Heart className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`}>
        <Sun className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`} variant="secondary">
        <Layers className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton}`} variant="ghost">
        <Type className="h-4 w-4" />
      </Button>

    </div>
  </div>

  {/* Full Rounded (Circle) Icon Buttons */}
  <div>
    <p className="mb-3 text-lg font-medium text-muted-foreground">
      Full Rounded
    </p>

    <div className="flex items-center gap-4 flex-wrap">

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <Home className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`} variant="destructive">
        <XCircle className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <CheckCircle className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <Info className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <AlertTriangle className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <Sparkles className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <Layers className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <Type className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <Sun className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <Layers className="h-4 w-4" />
      </Button>

      <Button className={`${glassButton} rounded-full w-10 h-10`}>
        <Type className="h-4 w-4" />
      </Button>

    </div>
  </div>

</div>


  </CardContent>
</Card>

  )
}
