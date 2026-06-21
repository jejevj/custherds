import VendorLoginPage from "./VendorLoginPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vendor Login",
  description: "Login to your Custherds Business Vendor dashboard.",
}

export default function Page() {
  return <VendorLoginPage />
}
