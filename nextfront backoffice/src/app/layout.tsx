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


/* SEO Metadata */
export const metadata: Metadata = {
  metadataBase: new URL("https://codervent.com"),

  title: {
  default: "Dashtrans - Next.js & ShadCN Admin Dashboard Template",
  template: "%s | Dashtrans",
},

  description:
    "Dashtrans is a premium admin dashboard template built with Next.js 16, ShadCN UI, Tailwind CSS v4, and TypeScript. Includes CRM, Analytics, eCommerce, Authentication, Charts, Widgets, Forms, Tables, and reusable UI components.",

  keywords: [
  "Dashtrans",
  "Next.js ShadCN Admin Template",
  "Next.js Dashboard",
  "Next.js 16 Admin Template",
  "ShadCN UI Dashboard",
  "ShadCN Admin Dashboard",
  "ShadCN UI Template",
  "Tailwind CSS Dashboard",
  "Tailwind CSS Admin Template",
  "TypeScript Dashboard",
  "Admin Dashboard Template",
  "CRM Dashboard",
  "Analytics Dashboard",
  "eCommerce Dashboard",
  "SaaS Dashboard",
  "Project Management Dashboard",
  "Application Dashboard",
  "Modern Admin Template",
  "Web App Dashboard",
  "Admin Panel Template",
  "Next.js Starter Template",
],

  authors: [
    {
      name: "Codervent",
      url: "https://codervent.com",
    },
  ],

  creator: "Codervent",
  publisher: "Codervent",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codervent.com",
    siteName: "Dashtrans",
    title: "Dashtrans - Next.js Admin Dashboard Template",
    description:
      "Premium admin dashboard template built with Next.js 16, ShadCN UI, Tailwind CSS v4 and TypeScript.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dashtrans Next.js Admin Dashboard",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Dashtrans - Next.js Admin Dashboard Template",
    description:
      "Modern admin dashboard template built with Next.js 16, ShadCN UI, Tailwind CSS v4 and TypeScript.",
    images: ["/og-image.jpg"],
    creator: "@codervent",
  },

}

/* Viewport */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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