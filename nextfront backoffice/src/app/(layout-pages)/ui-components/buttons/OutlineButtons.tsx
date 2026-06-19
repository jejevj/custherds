import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const glassOutline =
  "border border-border bg-white/[0.03] backdrop-blur-xl text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200";

export function OutlineButtons() {
    return (
        <Card>
            <CardHeader className="border-b py-4">
                <CardTitle className="text-xl">Outline Buttons</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-6">

                {/* Outline Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
  <Button variant="outline" className={`${glassOutline} px-6`}>Launch</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Fix</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Ship</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Audit</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Alert</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Build</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Sync</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Scale</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Release</Button>
  <Button variant="outline" className={`${glassOutline} px-6`}>Code</Button>
</div>

                {/* Rounded Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Compile</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Debug</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Test</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Review</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Monitor</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Maintain</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Optimize</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Merge</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Deploy</Button>
  <Button variant="outline" className={`${glassOutline} px-6 rounded-full`}>Design</Button>
</div>

            </CardContent>
        </Card>
    )
}