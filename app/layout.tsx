import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Footer from "../components/footer"

import { Geist, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "Cloud Dashboard | Cloud Infrastructure & AWS Regions Explorer",
  description: "Interactive cloud infrastructure dashboard. Explore cloud provider dependencies and AWS regions worldwide.",
  generator: "v0.app",
  keywords: ['cloud computing', 'AWS', 'Azure', 'GCP', 'infrastructure', 'data visualization', 'AWS regions', 'cloud dashboard'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Cloud Dashboard',
    description: 'Interactive cloud infrastructure dashboard. Explore cloud provider dependencies and AWS regions worldwide.',
    siteName: 'Cloud Dashboard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cloud Infrastructure Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cloud Dashboard',
    description: 'Interactive cloud infrastructure dashboard. Explore cloud provider dependencies and AWS regions worldwide.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
