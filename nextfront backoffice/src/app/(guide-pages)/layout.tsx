import { TooltipProvider } from "@/components/ui/tooltip"
import GuideLayout from "@/components/layout/guide-layout"
import { Toaster } from "sonner"

export default function GuidePages({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <GuideLayout>
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
      </GuideLayout>
    </TooltipProvider>
  )
}
