import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    FileText,
    BookmarkMinus,
    Calculator,
    Heart,
    Search,
    CheckSquare,
    MessageSquare,
    PieChart,
    Lock,
    Settings,
} from "lucide-react"

export function BasicListGroups() {
    return (
        <div>
            <h5 className="mb-6 text-lg font-bold">Basic List</h5>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">

                {/* ================= FIRST CARD ================= */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <ul className="divide-y">

                            <ListItem
                                icon={<FileText size={20} />}
                                title="Invoicing"
                                desc="Switch to more efficient process with our Invoicing system"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                            />

                            <ListItem
                                icon={<BookmarkMinus size={20} />}
                                title="Supplier 360"
                                desc="Manage all your suppliers in one place"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                            />

                            <ListItem
                                icon={<Calculator size={20} />}
                                title="Reconciliation"
                                desc="Say goodbye to manual calculations and errors."
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                            />

                            <ListItem
                                icon={<Heart size={20} />}
                                title="My GST Health"
                                desc="Keep track of your GST filings"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                            />

                            <ListItem
                                icon={<Search size={20} />}
                                title="GST Look Up"
                                desc="Look for supplier compliance"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                                isLast
                            />
                        </ul>
                    </CardContent>
                </Card>

                {/* ================= SECOND CARD ================= */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <ul className="divide-y">

                            <ListItem
                                icon={<CheckSquare size={20} />}
                                title="Task Tracker"
                                desc="Keep track of all your tasks"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                            />

                            <ListItem
                                icon={<MessageSquare size={20} />}
                                title="Team Chat"
                                desc="Communicate instantly with your team"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                            />

                            <ListItem
                                icon={<PieChart size={20} />}
                                title="Analytics Hub"
                                desc="Visualize your performance"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                            />

                            <ListItem
                                icon={<Lock size={20} />}
                                title="Secure Vault"
                                desc="Protect documents with encryption"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                            />

                            <ListItem
                                icon={<Settings size={20} />}
                                title="Settings"
                                desc="Customize your workspace"
                                iconClass="bg-primary/10 text-primary-500 shrink-0"
                                isLast
                            />
                        </ul>
                    </CardContent>
                </Card>

                {/* ================= THIRD CARD (IMAGE LIST) ================= */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <ul className="divide-y">

                            <li className="flex gap-4 p-4">
                                <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-xl border bg-muted/50">
                                    <img
                                        src="/pulse-ui-next/images/cards/eComm/01.png"
                                        alt="Wireless Headphones"
                                        className="h-12 w-12 object-contain filter grayscale"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold">Wireless Headphones</p>
                                    <p className="text-sm text-muted-foreground">
                                        Over-ear, noise-cancelling, Bluetooth 5.0
                                    </p>
                                </div>
                            </li>

                            <li className="flex gap-4 p-4">
                                <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-xl border bg-muted/30">
                                    <img
                                        src="/pulse-ui-next/images/cards/eComm/02.png"
                                        alt="Smartwatch Pro"
                                        className="h-12 w-12 object-contain filter grayscale"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold">Smartwatch Pro</p>
                                    <p className="text-sm text-muted-foreground">
                                        Track fitness and receive notifications
                                    </p>
                                </div>
                            </li>

                            <li className="flex gap-4 p-4">
                                <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-xl border bg-muted/30">
                                    <img
                                        src="/pulse-ui-next/images/cards/eComm/03.png"
                                        alt="RGB Gaming Mouse"
                                        className="h-12 w-12 object-contain filter grayscale"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold">RGB Gaming Mouse</p>
                                    <p className="text-sm text-muted-foreground">
                                        Ergonomic design with customizable lighting
                                    </p>
                                </div>
                            </li>

                            <li className="flex gap-4 p-4">
                                <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-xl border bg-muted/30">
                                    <img
                                        src="/pulse-ui-next/images/cards/eComm/04.png"
                                        alt="iPhone 16"
                                        className="h-12 w-12 object-contain filter grayscale"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold">iPhone 16</p>
                                    <p className="text-sm text-muted-foreground">
                                        Latest Apple device with A18 chip and Dynamic Island
                                    </p>
                                </div>
                            </li>

                            <li className="flex gap-4 p-4 rounded-b-2xl">
                                <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-xl border bg-muted/30">
                                    <img
                                        src="/pulse-ui-next/images/cards/eComm/05.png"
                                        alt="DSLR Camera"
                                        className="h-12 w-12 object-contain filter grayscale"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold">DSLR Camera</p>
                                    <p className="text-sm text-muted-foreground">
                                        20MP lens, 4K video, great for beginners
                                    </p>
                                </div>
                            </li>

                        </ul>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}

/* ================= REUSABLE LIST ITEM ================= */

function ListItem({
    icon,
    title,
    desc,
    iconClass,
    isLast,
}: any) {
    return (
        <li
            className={`flex gap-4 p-4 ${isLast ? "rounded-b-2xl" : ""
                }`}
        >
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
            >
                {icon}
            </div>

            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
        </li>
    )
}

