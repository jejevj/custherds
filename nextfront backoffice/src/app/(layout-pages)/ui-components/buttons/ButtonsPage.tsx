import {BasicButtons} from "./BasicButtons"
import {OutlineButtons} from "./OutlineButtons"
import {IconButtons} from "./IconButtons"
import {VariationsButtons} from "./VariationsButtons"
import {SocialButtonsCard} from "./SocialButtonsCard"

export default function ButtonsPage() {
    return (
        <div className="buttons-page-wrapper space-y-6">
            <BasicButtons/>
            <OutlineButtons/>
            <IconButtons/>
            <VariationsButtons/>
            <SocialButtonsCard/>
        </div>
    )
}