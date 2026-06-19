import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  EllipsisVertical,
  LogOutIcon,
  SettingsIcon,
  CreditCardIcon,
  UserIcon,
  Youtube,
  Film,
  DollarSign,
  Apple,
  Tickets
} from "lucide-react"

/* ---------------------------------- */
/* Data */
/* ---------------------------------- */

const transactions = [
  { name: "YouTube", date: "Jun 15", status: "Pending", amount: "-$50" },
  { name: "John Doe", date: "Jun 14", status: "Done", amount: "-$100" },
  { name: "Sans Brothers", date: "Jun 13", status: "Failed", amount: "$120" },
  { name: "Cinema City", date: "Jun 6", status: "Done", amount: "-$75" },
  { name: "To USD", date: "Jun 1", status: "Done", amount: "-$250" },
  { name: "Stripe Payout", date: "May 27", status: "Pending", amount: "$540" },
  { name: "Apple Store", date: "May 29", status: "Done", amount: "-$199" },
]


/* ---------------------------------- */
/* Icon + Color Helpers */
/* ---------------------------------- */

const ICON_MAP: Record<string, any> = {
  YouTube: Youtube,
  "John Doe": UserIcon,
  "Sans Brothers": CreditCardIcon,
  "Cinema City": Film,
  "To USD": DollarSign,
  "Apple Store": Apple,
  "Stripe Payout": Tickets,
}


/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

export default function TransactionsCard() {
  return (
    <Card className="h-auto w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">
            Transactions
          </CardTitle>
          <CardDescription>
            Recent transactions overview
          </CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full [&_svg]:size-5"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              View detailed report
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCardIcon className="mr-2 h-4 w-4" />
              Download report
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Export as CSV / PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Refresh data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-3">
        {transactions.map((item, index) => {
          const Icon = ICON_MAP[item.name] || UserIcon

          return (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/50 transition"
            >
              {/* Left */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted text-foreground">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium leading-none">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.date}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "pointer-events-none rounded-full px-3 border border-primary-300 text-xs font-medium bg-muted shadow-none text-foreground",
                    item.status === "Done" && "text-primary-800"
                  )}
                >
                  {item.status}
                </Badge>
                
                <span
                  className={cn(
                    "text-sm font-semibold",
                    item.amount.startsWith("-")
                      ? "text-muted-foreground"
                      : "text-primary-600"
                  )}
                >
                  {item.amount}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
