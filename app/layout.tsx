import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'THE WAR ROOM',
  description: 'Personal Command Center — Treynor Tetik',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
