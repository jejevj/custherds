import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Home,
  CheckCircle,
  Info,
  AlertTriangle,
  Heart,
  Sparkles,
} from "lucide-react"

const glassButton =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.20)] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200";


export function VariationsButtons() {
  return (
    <Card>
      <CardHeader className="border-b py-4">
        <CardTitle className="text-xl">
          Buttons With Different Variations
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8 p-6">

              {/* Light Version */}
              <div>
                  <p className="mb-3 text-lg font-medium text-muted-foreground">
                      Light Buttons
                  </p>

                  <div className="flex flex-wrap gap-3">

                      {/* Primary */}
                      <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <Home className="h-4 w-4" />
                          Launch
                      </Button>

                      {/* Success */}
                      <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <CheckCircle className="h-4 w-4" />
                          Ship
                      </Button>

                      {/* Info */}
                       <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <Info className="h-4 w-4" />
                          Audit
                      </Button>

                      {/* Warning */}
                      <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <AlertTriangle className="h-4 w-4" />
                          Alert
                      </Button>

                      {/* Pink */}
                      <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      
                      >
                          <Heart className="h-4 w-4" />
                          Sync
                      </Button>

                      {/* Purple Rounded */}
                      <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <Sparkles className="h-4 w-4" />
                          Scale
                      </Button>

                  </div>
              </div>


              {/* Outline Version */}
              <div>
                  <p className="mb-3 text-lg font-medium text-muted-foreground">
                      Outline Buttons
                  </p>

                  <div className="flex flex-wrap gap-3">

                      {/* Primary */}
                      <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <Home className="h-4 w-4" />
                          Compile
                      </Button>

                      {/* Success */}
                      <Button
                          variant="outline"
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <CheckCircle className="h-4 w-4" />
                          Test
                      </Button>

                      {/* Info */}
                       <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <Info className="h-4 w-4" />
                          Review
                      </Button>

                      {/* Warning */}
                       <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <AlertTriangle className="h-4 w-4" />
                          Monitor
                      </Button>

                      {/* Pink Rounded */}
                       <Button
                          className={`${glassButton} gap-2 px-6 transition-all duration-300`}
                      >
                          <Heart className="h-4 w-4" />
                          Merge
                      </Button>

                  </div>
              </div>


        {/* Icon Only Light */}
        <div>
          <p className="mb-3 text-lg font-medium text-muted-foreground">
            Icon Only (Light & Outline)
          </p>

          <div className="flex flex-wrap gap-4">

            <Button
              size="icon"
              className={`${glassButton} gap-2 transition-all duration-300`}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className={`${glassButton} gap-2 transition-all duration-300`}
            >
              <Info className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              className={`${glassButton} rounded-full gap-2 transition-all duration-300`}
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className={`${glassButton} rounded-full gap-2 transition-all duration-300`}
            >
              <Heart className="h-4 w-4" />
            </Button>

            {/* Gradient Icon Buttons */}

<Button
  size="icon"
  className={`${glassButton} rounded-full gap-2 transition-all duration-300`}
>
  <Sparkles className="h-4 w-4" />
</Button>

<Button
  size="icon"
  className={`${glassButton} rounded-full gap-2 transition-all duration-300`}
>
  <CheckCircle className="h-4 w-4" />
</Button>

<Button
  size="icon"
  className={`${glassButton} rounded-full gap-2 transition-all duration-300`}
>
  <Info className="h-4 w-4" />
</Button>

<Button
  size="icon"
  className={`${glassButton} rounded-full gap-2 transition-all duration-300`}
>
  <AlertTriangle className="h-4 w-4" />
</Button>

<Button
  size="icon"
  className={`${glassButton} rounded-full gap-2 transition-all duration-300`}
>
  <Heart className="h-4 w-4" />
</Button>

<Button
  size="icon"
  className={`${glassButton} rounded-full gap-2 transition-all duration-300`}
>
  <Home className="h-4 w-4" />
</Button>

  </div>
</div>


{/* Ghost Buttons */}
<div>
  <p className="mb-3 text-lg font-medium text-muted-foreground">
    Ghost Buttons
  </p>

  <div className="flex flex-wrap gap-3">

    <Button variant="ghost" className="gap-2 px-6 h-9">
      <Home className="h-4 w-4" />
      Trace
    </Button>

    <Button variant="ghost" className="gap-2 px-6 h-9">
      <AlertTriangle className="h-4 w-4" />
      Patch
    </Button>

  </div>
</div>
{/* Loading Buttons */}
<div>
  <p className="mb-3 text-lg font-medium text-muted-foreground">
    Loading State
  </p>

  <div className="flex flex-wrap gap-3">

    <Button disabled className="gap-2 px-6">
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
      </svg>
      Deploying
    </Button>

    <Button disabled variant="outline" className="gap-2 px-6">
      Pending
    </Button>

  </div>
</div>
{/* Icon Right */}
<div>
  <p className="mb-3 text-lg font-medium text-muted-foreground">
    Icon Right
  </p>

  <div className="flex flex-wrap gap-3">

    <Button className="gap-2 px-6">
      Integrate
      <Sparkles className="h-4 w-4" />
    </Button>

    <Button variant="outline" className="gap-2 px-6">
      Inspect
      <Info className="h-4 w-4" />
    </Button>

  </div>
</div>
{/* Animated Hover */}
<div>
  <p className="mb-3 text-lg font-medium text-muted-foreground">
    Animated Hover
  </p>

  <div className="flex flex-wrap gap-3">

    <Button className="gap-2 px-6 transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <Heart className="h-4 w-4" />
      Review
    </Button>

    <Button className="gap-2 px-6 transition-all duration-300 hover:-translate-y-1">
      <Sparkles className="h-4 w-4" />
      Optimize
    </Button>

  </div>
</div>
{/* Glass Buttons */}
<div>
  <p className="mb-3 text-lg font-medium text-muted-foreground">
    Glass Style
  </p>

  <div className="flex flex-wrap gap-3">

    <Button className="backdrop-blur-md bg-white/30 border border-white/40 text-foreground gap-2 px-6">
      <Sparkles className="h-4 w-4" />
      Pipeline
    </Button>

    <Button className="rounded-full backdrop-blur-md bg-primary/20 border border-primary/30 gap-2 px-6">
      <CheckCircle className="h-4 w-4" />
      Deploy
    </Button>

  </div>
</div>


        

      </CardContent>
    </Card>
  )
}
