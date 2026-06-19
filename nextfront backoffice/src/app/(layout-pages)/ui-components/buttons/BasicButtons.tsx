import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
export function BasicButtons() {

  const glassButton =
  "border border-white/10 bg-muted backdrop-blur-xl text-foreground hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200";


  return (
    <Card>
      <CardHeader className="border-b py-4">
        <CardTitle className="text-xl">Basic Buttons</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6">

        {/* Default Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button className={`${glassButton} px-6`}>Deploy</Button>
          <Button className={`${glassButton} px-6`}>Debug</Button>
          <Button className={`${glassButton} px-6`}>Commit</Button>
          <Button className={`${glassButton} px-6`}>Build</Button>
          <Button className={`${glassButton} px-6`}>Test</Button>
          <Button className={`${glassButton} px-6`}>Merge</Button>
          <Button className={`${glassButton} px-6`}>Review</Button>
          <Button className={`${glassButton} px-6`}>Release</Button>
          <Button className={`${glassButton} px-6`}>Branch</Button>
          <Button className={`${glassButton} px-6`}>Script</Button>
          <Button className={`${glassButton} px-6`}>Design</Button>
        </div>

        {/* Rounded Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button className={`${glassButton} px-6 rounded-full`}>Compile</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Integrate</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Optimize</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Validate</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Document</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Automate</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Monitor</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Scale</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Refactor</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Prototype</Button>
          <Button className={`${glassButton} px-6 rounded-full`}>Maintain</Button>
        </div>
       
      </CardContent>
    </Card>
  )
}
