import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import UIThemeProvider from "@/providers/ui-theme-provider"
import ThemeCustomizer from "@/components/theme-customizer"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://partners-custherds.ourtestcloud.my.id"),

  title: {
    default: "Custherds Partners",
    template: "%s | Custherds Partners",
  },

  description:
    "Custherds partner dashboard for Herd Guides and Business Vendors. Manage bookings, track referrals, and monitor your earnings.",

  keywords: [
    "Custherds",
    "Herd Guide",
    "Business Vendor",
    "Affiliate Dashboard",
    "Tour Guide Bali",
    "Partner Dashboard",
  ],

  authors: [{ name: "Custherds", url: "https://custherds.com" }],
  creator: "Custherds",
  publisher: "Custherds",

  robots: { index: false, follow: false },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://partners-custherds.ourtestcloud.my.id",
    siteName: "Custherds Partners",
    title: "Custherds Partners Dashboard",
    description: "Manage your Custherds guide or vendor account.",
    images: [{ url: "/logo-1.png", width: 400, height: 120, alt: "Custherds" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c9a84c",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon — explicit link to bypass Next.js default icon resolution */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo-1.png" />
        <link
          href="https://cdn.boxicons.com/3.0.8/fonts/basic/boxicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="gaussian-black"
          enableSystem
          disableTransitionOnChange
        >
          <UIThemeProvider>
            {children}
          </UIThemeProvider>
          <ThemeCustomizer />
        </ThemeProvider>
      </body>
    </html>
  )
}
