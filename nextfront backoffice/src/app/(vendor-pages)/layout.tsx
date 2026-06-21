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
          richColors={false}
          closeButton
          toastOptions={{
            classNames: {
              toast: `
                bg-card/30
                backdrop-blur-xl
                border
                border-border
              `,
            },
          }}
        />
      </VendorLayout>
    </TooltipProvider>
  )
}
