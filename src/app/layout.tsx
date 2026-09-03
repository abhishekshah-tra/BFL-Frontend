import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { AuthGate } from '@/components/auth/AuthGate'
import './globals.css'
import '@/styles/personas.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BFL Digital Twin',
    template: '%s | BFL Digital Twin',
  },
  description:
    "Real-time visibility of an item's journey across the supply chain and warehouse network",
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      {/*
        suppressHydrationWarning on <body> only ignores mismatches on this exact
        element (e.g. attributes injected by browser extensions like ColorZilla's
        `cz-shortcut-listen`). It does NOT suppress hydration warnings anywhere
        else in the tree.
      */}
      <body className={inter.className} suppressHydrationWarning>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  )
}
