import { TooltipProvider } from "@/components/ui/tooltip"
import VendorLayout from "@/components/layout/vendor-layout"
import { Toaster } from "sonner"

export default function VendorPages({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <VendorLayout>
        {children}
        <Toaster
          theme="dark"
          richColors={false}
          closeButton
          toastOptions={{
            classNames: {
              toast: `
                bg-card/80
                backdrop-blur-xl
                border
                border-border
                text-foreground
              `,
              title: "text-foreground font-semibold",
              description: "text-muted-foreground",
              closeButton: "text-foreground border-border",
            },
          }}
        />
      </VendorLayout>
    </TooltipProvider>
  )
}
