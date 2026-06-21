import GuideLoginPage from "./GuideLoginPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Guide Login | Custherds Partners",
  description: "Login to your Custherds Herd Guide dashboard.",
}

export default function Page() {
  return <GuideLoginPage />
}
