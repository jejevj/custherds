import { TooltipProvider } from "@/components/ui/tooltip"
import AdminPortalLayout from "@/components/layout/admin-portal-layout"
import { Toaster } from "sonner"

export default function AdminPages({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <AdminPortalLayout>
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
      </AdminPortalLayout>
    </TooltipProvider>
  )
}
