
 import { TooltipProvider } from "@/components/ui/tooltip"
 import AdminLayout from "@/components/layout/admin-layout"
 import { Toaster } from "sonner"
export default function LayoutPages({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={0}>
        <AdminLayout>
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
          
        </AdminLayout>
    </TooltipProvider>
  )
}