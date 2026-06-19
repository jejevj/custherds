
import { AlertsBasic } from "./BasicAlerts"
import { SolidBgColorAlerts } from "./SolidBgColorAlerts"
import {IconCircleAlerts} from "./IconCircleAlerts"

export default function AlertsPage() {

  return (
    <div className="space-y-6">
      <AlertsBasic />
      <SolidBgColorAlerts/>
      <IconCircleAlerts/>
    </div>
  )
}
