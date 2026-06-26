"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { ShieldAlert } from "lucide-react"

/**
 * Drop this into any dashboard page (or layout).
 * Reads ?reason=unauthorized_role from the URL, fires a toast, then
 * removes the query param so it doesn’t persist on refresh.
 */
export function UnauthorizedToast() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  useEffect(() => {
    const reason = searchParams.get("reason")
    if (reason === "unauthorized_role") {
      toast.error("Access Denied", {
        description: "You don't have permission to access that page. Redirected to your dashboard.",
        icon: <ShieldAlert className="w-4 h-4" />,
        duration: 5000,
      })
      // Clean up the query param from the URL without re-render
      const params = new URLSearchParams(searchParams.toString())
      params.delete("reason")
      const clean = params.size > 0 ? `${pathname}?${params}` : pathname
      router.replace(clean)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
