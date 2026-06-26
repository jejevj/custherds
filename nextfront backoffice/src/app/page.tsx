import LandingPage from "@/components/landing-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Custherds Partners",
  description: "Partner portal for Guides and Vendors on Custherds.",
}

export default function Page() {
  return <LandingPage />
}
