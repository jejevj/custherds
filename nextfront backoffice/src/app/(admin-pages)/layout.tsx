import { TooltipProvider } from "@/components/ui/tooltip"
import AdminPortalLayout from "@/components/layout/admin-portal-layout"
import { Toaster } from "sonner"
import SessionCheck from "@/components/layout/SessionCheck"

export default function AdminPages({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <SessionCheck />
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
